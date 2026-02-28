# =========================
# Stage 1: Dependencies
# =========================
FROM node:22-alpine AS deps

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001
# نسخ ملفات package.json فقط
COPY package*.json ./

# تثبيت الباكيجات (بدون مشاكل لو package-lock.json موجود أو لا)
RUN npm install --omit=dev \
    && npm cache clean --force

# =========================
# Stage 2: App
# =========================
FROM node:22-alpine

WORKDIR /app

# تحديث النظام وتقليل الكاش
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# نسخ node_modules من المرحلة السابقة
COPY --from=deps /app/node_modules ./node_modules

# نسخ باقي ملفات المشروع
COPY . .

# تغيير ملكية الملفات ليوزر node
RUN chown -R node:node /app

USER node

EXPOSE 3001

CMD ["node", "app.js"]