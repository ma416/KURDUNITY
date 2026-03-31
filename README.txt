Kurdistan Unity RP — secured build
================================

ئەم وەشانە چاککراوە بۆ ئەوەی پرۆژەکە پارێزراوتر بێت و secret ـەکان لە ناو frontend نەبن.

چی چاک کرا؟
- Discord webhook لە frontend لابرا و کرا بە backend admin route
- .env پاک کرا و secret ـە دەرخراوەکان سڕایەوە
- .env.example زیاد کرا بۆ ڕێکخستن
- admin default credentials لە code لابرا؛ ئێستا دەبێت لە .env دابنرێت
- OAuth state پارێزراوتر کرا
- admin login rate-limit زیاد کرا
- session ـەکان expiration ـیان هەیە
- public rendering لە چەند شوێنێک escape کرا بۆ کەمکردنەوەی XSS
- meta backend base کرا بە auto بۆ ئاسانترکردنی deploy

ڕێکخستن:
1) بچۆ بۆ backend/
2) npm install
3) .env.example کۆپی بکە بۆ .env
4) لە .env ئەمانە بنووسە:
   - DISCORD_CLIENT_ID
   - DISCORD_CLIENT_SECRET
   - DISCORD_BOT_TOKEN
   - DISCORD_GUILD_ID
   - DISCORD_REDIRECT_URI
   - FRONTEND_URL
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - DISCORD_WEBHOOK_URL (ئەمە هەڵبژاردەییە)
5) npm start
6) وێبسایت بکەرەوە لە http://127.0.0.1:3000

گرنگ:
- ئەو secret ـانەی لە وەشانی پێشوو دەرکەوتبوون، دەبێت لە Discord/Firebase هەموویان rotate بکرێن
- بۆ Firebase security rules، هێشتا دەبێت لە dashboard ـی Firebase چاک بکرێن
- backend/data/ و backend/.env مەخەنە git
