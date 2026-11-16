# SMS

Onyx sends and receives SMS through **Twilio**.

This has not been run against Twilio from where it was written. The webhook, its signature check and sending are
tested against the documented shapes of Twilio's requests; your first real text is the live test.

## Before you start: US numbers need registration

To text US phones from a regular US number, carriers require **A2P 10DLC registration** (a brand and a campaign),
which Twilio walks you through and which can take days. A **toll-free number** needs toll-free verification instead.
Until one of them is approved, messages may be blocked. Start this first.

## Steps

1. Create a Twilio account and buy a number that can send SMS.
2. Start a tunnel and set `PUBLIC_URL` and `ONYX_PASSWORD` in `.env`, as in SETUP_WHATSAPP.md steps 1 and 2.
3. From the Twilio console copy the **Account SID** to `TWILIO_ACCOUNT_SID` and the **Auth Token** to
   `TWILIO_AUTH_TOKEN`. Put your Twilio number in `TWILIO_FROM`, in the form `+15125550123`.
4. Restart Onyx (`pnpm start`).
5. In Twilio, open the number's settings and under Messaging set "A message comes in" to a webhook:
   `PUBLIC_URL/webhooks/sms`, method POST.
6. In Onyx, Settings, Your phone: choose SMS, enter your number, and text the six-digit code to the Twilio number.

`PUBLIC_URL` must be exactly the address Twilio calls: Twilio signs each request with it, and Onyx rejects a request
whose signature doesn't match.

## Limits to know

- Long replies are split into numbered parts, at most four; beyond that the reply is cut and says so.
- Twilio does not retry a webhook that fails. A text sent while this PC or the tunnel is down is lost; send it again.
- Each text costs money on Twilio's side. Onyx does not track that cost.
