#!/usr/bin/env bash
# Get MFA-authenticated temporary credentials (needed because the AWS account
# enforces a ForceMFA policy) and save them as a separate CLI profile.
#
# Usage: scripts/aws-mfa-login.sh <6-digit MFA code>
# Env:   SRC_PROFILE (default: s-hossain)       profile holding your access keys
#        DST_PROFILE (default: $SRC_PROFILE-mfa) profile to write temp creds to
set -euo pipefail

code="${1:?usage: $0 <6-digit MFA code>}"
src="${SRC_PROFILE:-s-hossain}"
dst="${DST_PROFILE:-$src-mfa}"

serial=$(aws iam list-mfa-devices --profile "$src" \
  --query 'MFADevices[0].SerialNumber' --output text)
if [[ -z "$serial" || "$serial" == "None" ]]; then
  echo "No MFA device found for profile '$src'" >&2
  exit 1
fi

read -r key secret token expires < <(aws sts get-session-token --profile "$src" \
  --serial-number "$serial" --token-code "$code" --duration-seconds 43200 \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken,Expiration]' \
  --output text)

aws configure set aws_access_key_id "$key" --profile "$dst"
aws configure set aws_secret_access_key "$secret" --profile "$dst"
aws configure set aws_session_token "$token" --profile "$dst"
aws configure set region "$(aws configure get region --profile "$src")" --profile "$dst"

echo "Saved MFA credentials to profile '$dst' (expires $expires)"
