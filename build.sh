#!/bin/bash

echo "📦 Installing dependencies..."
npm install

echo "🌐 Downloading Chromium manually..."
node node_modules/puppeteer/install.js
