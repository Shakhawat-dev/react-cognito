#!/usr/bin/env bash
# Turn on the Cognito Hosted UI for the existing user pool and app client:
#   1. create a Cognito-prefixed domain (<prefix>.auth.<region>.amazoncognito.com), if the pool has none
#   2. enable the OAuth authorization code flow (PKCE) on the app client
#   3. for a managed login (version 2) domain, give the client Cognito's default branding style
#   4. write the domain in use into amplify_outputs.json
#
# update-user-pool-client resets every setting it isn't given, so the client's current settings are
# read first and only the OAuth fields are changed.
#
# Usage: scripts/setup-hosted-ui.sh [domain-prefix]
# Env:   PROFILE   (default: s-hossain-mfa)
#        POOL_ID   (default: from amplify_outputs.json)
#        CLIENT_ID (default: from amplify_outputs.json)
#        APP_URL   (default: http://localhost:5173)
set -euo pipefail

prefix="${1:-aps-notify-practice}"
profile="${PROFILE:-s-hossain-mfa}"
outputs="$(dirname "$0")/../amplify_outputs.json"
pool="${POOL_ID:-$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["auth"]["user_pool_id"])' "$outputs")}"
client="${CLIENT_ID:-$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["auth"]["user_pool_client_id"])' "$outputs")}"
app_url="${APP_URL:-http://localhost:5173}"
region="${pool%%_*}"
aws=(aws --profile "$profile" --region "$region")

existing=$("${aws[@]}" cognito-idp describe-user-pool --user-pool-id "$pool" \
  --query 'UserPool.Domain' --output text)
if [[ -z "$existing" || "$existing" == "None" ]]; then
  "${aws[@]}" cognito-idp create-user-pool-domain --user-pool-id "$pool" --domain "$prefix" >/dev/null
  echo "Created domain $prefix.auth.$region.amazoncognito.com"
else
  echo "Pool already has domain '$existing' (not changed)"
  prefix="$existing"
fi

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
"${aws[@]}" cognito-idp describe-user-pool-client --user-pool-id "$pool" --client-id "$client" \
  --query UserPoolClient --output json >"$tmp"

python3 - "$tmp" "$app_url" <<'EOF'
import json, sys
path, app_url = sys.argv[1], sys.argv[2]
current = json.load(open(path))
# Fields UpdateUserPoolClient accepts; anything else in the describe output is read-only.
updatable = {
    "UserPoolId", "ClientId", "ClientName", "RefreshTokenValidity", "AccessTokenValidity",
    "IdTokenValidity", "TokenValidityUnits", "ReadAttributes", "WriteAttributes", "ExplicitAuthFlows",
    "SupportedIdentityProviders", "CallbackURLs", "LogoutURLs", "DefaultRedirectURI",
    "AllowedOAuthFlows", "AllowedOAuthScopes", "AllowedOAuthFlowsUserPoolClient",
    "AnalyticsConfiguration", "PreventUserExistenceErrors", "EnableTokenRevocation",
    "EnablePropagateAdditionalUserContextData", "AuthSessionValidity", "RefreshTokenRotation",
}
update = {k: v for k, v in current.items() if k in updatable}
update.update({
    "SupportedIdentityProviders": ["COGNITO"],
    "AllowedOAuthFlows": ["code"],
    "AllowedOAuthFlowsUserPoolClient": True,
    # aws.cognito.signin.user.admin lets the access token call the user's own APIs
    # (fetchUserAttributes, updateUserAttribute, updatePassword).
    "AllowedOAuthScopes": ["openid", "email", "profile", "aws.cognito.signin.user.admin"],
    "CallbackURLs": [f"{app_url}/auth/callback"],
    "LogoutURLs": [f"{app_url}/login"],
})
json.dump(update, open(path, "w"))
EOF

"${aws[@]}" cognito-idp update-user-pool-client --cli-input-json "file://$tmp" >/dev/null
echo "Enabled OAuth code flow on client $client"

# Managed login (version 2) shows "login pages unavailable" (HTTP 403) until the app client has a
# branding style. Use Cognito's default look; it can be customised later in the console.
version=$("${aws[@]}" cognito-idp describe-user-pool-domain --domain "$prefix" \
  --query 'DomainDescription.ManagedLoginVersion' --output text)
if [[ "$version" == "2" ]]; then
  if "${aws[@]}" cognito-idp describe-managed-login-branding-by-client --user-pool-id "$pool" \
    --client-id "$client" >/dev/null 2>&1; then
    echo "Client already has a managed login branding style (not changed)"
  else
    "${aws[@]}" cognito-idp create-managed-login-branding --user-pool-id "$pool" \
      --client-id "$client" --use-cognito-provided-values >/dev/null
    echo "Created default managed login branding for client $client"
  fi
fi

# Keep the app's config pointing at the domain actually in use.
python3 - "$outputs" "$prefix.auth.$region.amazoncognito.com" <<'EOF'
import json, sys
path, domain = sys.argv[1], sys.argv[2]
outputs = json.load(open(path))
oauth = outputs["auth"].get("oauth")
if oauth and oauth.get("domain") != domain:
    oauth["domain"] = domain
    with open(path, "w") as f:
        json.dump(outputs, f, indent=2)
        f.write("\n")
    print(f"Updated oauth.domain in amplify_outputs.json to {domain}")
EOF
echo "Hosted UI: https://$prefix.auth.$region.amazoncognito.com/login?client_id=$client&response_type=code&redirect_uri=$app_url/auth/callback"
