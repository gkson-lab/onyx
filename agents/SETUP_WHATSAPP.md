# WhatsApp

Onyx uses Meta's official **WhatsApp Business Cloud API**. It does not use unofficial WhatsApp Web libraries: those
break WhatsApp's terms and get numbers banned.

This has not been run against Meta's servers from where it was written. The webhook, signature check, sending and
the 24-hour rule are tested against recorded shapes of Meta's requests; your first real message is the live test.

## What you need

- A Meta developer account and a Meta Business account (free).
- A phone number for the business side. Meta gives you a free **test number** that can message up to five phones
  you add by hand: enough for personal use. A number of your own needs business verification.
- This PC reachable from the internet through a tunnel, because Meta delivers your messages to a public address.

## Steps

1. **Tunnel.** Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
   and run `cloudflared tunnel --url http://127.0.0.1:8787`. It prints an address like
   `https://something.trycloudflare.com`. That quick address changes every time you restart it; for one that stays,
   create a named tunnel on a domain you own.
2. **`.env`.** Set `PUBLIC_URL` to that address, and set `ONYX_PASSWORD`: once the tunnel is up, the app is on the
   internet, and the password is what keeps other people out of it.
3. **Meta app.** At developers.facebook.com create an app of type Business and add the WhatsApp product. On its
   API Setup page copy the **Phone number ID** to `WHATSAPP_PHONE_ID`, and add your own phone as a recipient.
4. **Token.** The token on that page lasts a day. For one that lasts, create a System User in Business Settings,
   give it the app with `whatsapp_business_messaging`, and generate a token. Put it in `WHATSAPP_TOKEN`.
5. **App secret.** App settings, Basic, App secret: put it in `WHATSAPP_APP_SECRET`. Onyx uses it to check that each
   webhook really came from Meta.
6. **Verify token.** Make up a long random string and put it in `WHATSAPP_VERIFY_TOKEN`.
7. Restart Onyx (`pnpm start`).
8. **Webhook.** In the WhatsApp product's Configuration, set the callback URL to `PUBLIC_URL/webhooks/whatsapp` and
   the verify token to the string from step 6, then subscribe to the `messages` field.
9. **Link your phone.** In Onyx, Settings, Your phone: choose WhatsApp, enter your number, and text the six-digit
   code to the business number. Onyx replies that the number is linked.

## Onyx texting you first

WhatsApp only allows free-form messages within 24 hours of your last message to the business. Outside that window
Onyx sends a **template**, which Meta must approve first. Create one in WhatsApp Manager named `onyx_alert`
(category Utility, language English US) with the body `{{1}}`-style single variable, for example:

> Onyx: {{1}}

If you name it differently, set `WHATSAPP_TEMPLATE`. Until a template is approved, reminders outside the window
fail on WhatsApp and fall back to your next channel.

## Limits to know

- Text only. Onyx answers voice notes and images by saying it can't read them yet.
- If this PC or the tunnel is down, Meta retries delivery for a while, then gives up.
