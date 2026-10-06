# React + AWS Cognito (Amplify Gen 2)

Email + password authentication for a React app, backed by an **Amazon Cognito User Pool** that is defined in code with **AWS Amplify Gen 2**. The sign-in UI is made of custom forms (not the prebuilt Amplify Authenticator).

**Features:** sign up, email verification code (with resend), sign in, sign out, protected route, session kept across page reloads.

**Stack:** Vite · React 19 · TypeScript · React Router 7 · `aws-amplify` v6 · Amplify Gen 2 backend (`@aws-amplify/backend`)

---

## Prerequisites

- **Node.js 18+** (developed on v22)
- An **AWS account**
- **AWS CLI v2**: `brew install awscli` (macOS) or see the [AWS CLI install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## 1. Set up AWS credentials (one time)

The Amplify sandbox deploys real AWS resources, so it needs credentials with the **`AmplifyBackendDeployFullAccess`** policy. Choose one of these options.

### Option A: IAM Identity Center (SSO), recommended

```bash
aws configure sso
```

| Prompt | What to enter |
|---|---|
| SSO session name | Any label, e.g. `my-sso` |
| SSO start URL | AWS Console → IAM Identity Center → Dashboard → *AWS access portal URL* |
| SSO region | The region where Identity Center is enabled, e.g. `us-east-1` |
| SSO registration scopes | Press Enter (default) |
| *(browser opens: log in and click Allow)* | |
| Account / role | Pick the role that has `AmplifyBackendDeployFullAccess` |
| Default client Region | Region for the Cognito pool, e.g. `us-east-1` |
| Default output format | `json` |
| Profile name | `amplify-dev` |

When the session expires, run `aws sso login --profile amplify-dev`.

### Option B: IAM access keys (simpler, fine for local learning)

1. AWS Console → **IAM** → Users → **Create user**, then attach the `AmplifyBackendDeployFullAccess` policy.
2. Open the user → **Security credentials** → **Create access key** → *Command Line Interface*.
3. Run:
   ```bash
   aws configure --profile amplify-dev
   ```
   Paste the access key ID and secret, set a region (e.g. `us-east-1`), and choose output `json`.

## 2. Install dependencies

```bash
npm install
```

## 3. Deploy your personal backend (Cognito sandbox)

```bash
npx ampx sandbox --profile amplify-dev
```

- The first run in a new region may ask you to **bootstrap** the region. Follow the link it prints, then re-run the command.
- When it finishes, it writes **`amplify_outputs.json`** to the project root. This file holds the User Pool ID, client ID and region, and the app reads it at startup. It is git-ignored and **must exist before the app can build or run**.
- Leave this terminal running. It watches `amplify/` and redeploys when you change backend code.

## 4. Run the app

In a second terminal:

```bash
npm run dev
```

Open http://localhost:5173.

## Using the app

1. **Sign up** (`/signup`): enter an email and a password (min 8 chars, with uppercase, lowercase, a number and a symbol).
2. **Verify** (`/confirm`): Cognito emails you a 6-digit code. Enter it here, or click *Resend code*.
3. **Sign in** (`/login`): use the same email and password.
4. **Home** (`/`): a protected page showing your email, Cognito user ID (`sub`) and ID-token expiry. Click **Sign out** to end the session.

Visiting `/` while signed out redirects you to `/login`. Visiting `/login` or `/signup` while signed in redirects you to `/`.

You can see the registered users in **AWS Console → Cognito → User pools → (your `amplify-…-sandbox` pool) → Users**.

> Cognito's default email sender is limited to about 50 emails per day. That is fine for development; configure Amazon SES for production.

## Project structure

```
amplify/
  backend.ts            # Registers backend resources (auth only)
  auth/resource.ts      # Cognito config: email login, verification email text
src/
  main.tsx              # Amplify.configure(amplify_outputs.json), Router, AuthProvider
  App.tsx               # Routes: /login, /signup, /confirm, protected /
  auth/
    AuthContext.tsx     # AuthProvider: current user + Hub auth event listener
    useAuth.ts          # useAuth() hook: { user, loading, refresh, logout }
    ProtectedRoute.tsx  # ProtectedRoute / PublicOnlyRoute guards
    errors.ts           # Turns Amplify errors into display messages
  pages/
    SignUp.tsx  ConfirmSignUp.tsx  SignIn.tsx  Home.tsx
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build to `dist/` (needs `amplify_outputs.json`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |
| `npx ampx sandbox` | Deploy and watch your personal cloud backend |
| `npx ampx sandbox delete` | Delete your sandbox resources from AWS |

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module '../amplify_outputs.json'` | Run `npx ampx sandbox --profile amplify-dev` first |
| `The security token included in the request is expired` / SSO errors | `aws sso login --profile amplify-dev` |
| `Unable to resolve AWS account` | You didn't pass `--profile`, or the profile name is wrong (check `~/.aws/config`) |
| Bootstrap error on first deploy | Open the printed link, bootstrap the region, re-run the sandbox |
| `UsernameExistsException` on sign up | The email is already registered: sign in, or verify it via `/confirm` |
| `UserNotConfirmedException` / redirected to `/confirm` | Enter the emailed code, or click *Resend code* |
| Verification email not arriving | Check spam; Cognito's default sender has a daily limit |

## Cleaning up

To remove the Cognito User Pool and the other sandbox resources from your AWS account:

```bash
npx ampx sandbox delete --profile amplify-dev
```

## Next steps

- Forgot / reset password: `resetPassword`, `confirmResetPassword`
- Social login (Google): `externalProviders` in `amplify/auth/resource.ts` plus `signInWithRedirect`
- MFA (TOTP)
- Production deploy with [Amplify Hosting](https://docs.amplify.aws/react/deploy-and-host/), which generates `amplify_outputs.json` in CI
