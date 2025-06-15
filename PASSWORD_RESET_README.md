# Password Reset Workflow

This document outlines how to set up and use the password reset functionality in the Slayz.cc application.

## Overview

The password reset workflow allows users to reset their password if they forget it. The process is secure and follows best practices:

1. User requests a password reset by providing their email address
2. A secure one-time token is generated and stored in the database
3. An email with a password reset link is sent to the user's email address
4. User clicks the link and enters a new password
5. The system verifies the token and updates the user's password
6. The token is invalidated after use

## Setup Instructions

### 1. Environment Configuration

Make sure your `.env` file includes the following variables:

```
# Resend API for emails - REQUIRED for password reset functionality
# Sign up at https://resend.com to get an API key
RESEND_API_KEY=your_resend_api_key

# Custom email sender address (optional)
# If not provided, will use the Resend test address 'onboarding@resend.dev'
# For production, you should verify your domain in Resend and use your own address
EMAIL_FROM=your-verified-email@yourdomain.com

# PostgreSQL Database Configuration (used for storing reset tokens)
DATABASE_URL=your_postgres_connection_string
```

### 2. Create the Password Reset Tokens Table

Run the migration script to create the necessary database table:

```bash
node migrations/run-reset-tokens-migration.js
```

This will create a `password_reset_tokens` table in your database to store the reset tokens.

### 3. Test the Password Reset Flow

1. Navigate to the login page
2. Click "Forgot Password"
3. Enter your email address and complete the CAPTCHA
4. Check your email for the reset link
5. Click the link and set a new password

## Security Features

The password reset workflow includes the following security features:

- **Time-limited tokens**: Reset tokens expire after 1 hour
- **One-time use**: Tokens are invalidated after use
- **Secure storage**: Tokens are stored in the database with secure indices
- **Anti-enumeration protection**: The system doesn't reveal whether an email exists in the database
- **CAPTCHA protection**: Prevents automated abuse of the reset flow
- **Secure email delivery**: Uses Resend API for reliable email delivery
- **Password strength enforcement**: Requires passwords to be at least 8 characters long

## Troubleshooting

### Email Not Received

- Check your spam folder
- Verify that `RESEND_API_KEY` is correctly set in your `.env` file
- Ensure the email address exists in your user database
- Check server logs for email sending errors

### Invalid Reset Link

- The link may have expired (tokens expire after 1 hour)
- The token may have already been used
- The URL parameters may have been modified or corrupted

### Development Mode

In development mode (`NODE_ENV=development`), the reset link will be displayed in the UI and server logs for testing purposes, even if email sending fails.

## Implementation Details

- Client-side form validation in `client/src/components/forgot-password-modal.tsx`
- Server-side token generation and validation in `server/routes.ts`
- Database schema for tokens in `server/schema.ts`
- Reset password page in `client/src/pages/reset-password.tsx`
- Email HTML template embedded in the server routes file 