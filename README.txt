Mr.Degree website - static, SEO-ready (19 pages)
Live: https://mrdegree.netlify.app  (Netlify, deploys automatically from github.com/apogeekerala/mrdegree-website)

1. Demo values to replace (all .html files, sitemap.xml, robots.txt):
   1800 000 0000 / 18000000000      -> toll-free number
   +91 98765 43210 / 919876543210   -> WhatsApp number
   hello@mrdegree.in                -> email
   Footer social links (href="#")   -> Instagram / YouTube / Facebook URLs (also add as "sameAs" in JSON-LD)
   When a custom domain is connected, replace https://mrdegree.netlify.app with it.

2. Analytics (main.js, top of file): GA4_ID = 'G-XXXXXXXXXX', META_PIXEL_ID = '1234567890'.
   Events: generate_lead, contact_whatsapp, contact_call, route_quiz_complete, verify_university, exit_popup_view.

3. Enquiry form: Netlify Forms ("enquiry"). Leads appear in Netlify > Forms. Add an email notification there.
   Fields: name, phone, language, course, callback_time, message, consent, quiz, page, utm.

4. After launch: Google Search Console + sitemap.xml, Google Business Profile.
