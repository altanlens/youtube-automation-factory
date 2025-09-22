#!/bin/bash

# DevContainer MCP Setup Script
# Video Otomasyon Platformu için özelleştirilmiş
# GitHub MCP entegrasyonu ile "easy, actually" tarzı video üretimi için

set -e

echo "🎬 Video Otomasyon Platformu - GitHub MCP Kurulum"
echo "=================================================="

# Claude Code kurulum kontrolü
if ! command -v claude &> /dev/null; then
    echo "⚠️  Claude Code bulunamadı. Kuruluyor..."
    npm install -g @anthropic-ai/claude-code@latest
fi

echo "✅ Claude Code $(claude --version 2>/dev/null || echo 'installed') hazır"

# Claude dizinini oluştur
mkdir -p ~/.claude

# API Key helper script'i oluştur
cat > ~/.claude/anthropic_key_helper.sh << 'EOF'
#!/bin/bash
echo "${ANTHROPIC_API_KEY}"
EOF

chmod +x ~/.claude/anthropic_key_helper.sh

# Video Otomasyon Platformu için özelleştirilmiş Claude ayarları
cat > ~/.claude/claude.json << EOF
{
  "apiKeyHelper": "/home/node/.claude/anthropic_key_helper.sh",
  "permissions": {
    "mcp__github": "allow",
    "mcp__context7": "allow"
  },
  "settings": {
    "autoApprove": true,
    "dangerouslySkipPermissions": true,
    "disableNonessentialTraffic": true
  }
}
EOF

echo "🔧 GitHub MCP Server yapılandırılıyor..."

# Token kontrolü
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN bulunamadı!"
    echo ""
    echo "🔑 GitHub Token oluşturmak için:"
    echo "   1. https://github.com/settings/personal-access-tokens/new"
    echo "   2. Fine-grained token oluşturun"
    echo "   3. Repository access: altanlens/youtube-automation-factory"
    echo "   4. Permissions > Contents: Read and write"
    echo "   5. Token'ı GITHUB_TOKEN olarak export edin"
    echo ""
    echo "Yerel makinenizde:"
    echo "   export GITHUB_TOKEN=\"ghp_your_token_here\""
    echo "   export ANTHROPIC_API_KEY=\"your_api_key\""
    echo ""
    echo "⏭️  Şimdilik devam ediyorum, token olmadan da container çalışacak..."
else
    echo "🔑 GITHUB_TOKEN OK: ${GITHUB_TOKEN:0:8}..."
fi

# Anthropic API Key kontrolü
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY bulunamadı!"
    echo "Token olmadan da container çalışacak, ancak Claude Code kullanılamayacak."
else
    echo "🔑 ANTHROPIC_API_KEY OK"
fi

# GitHub MCP Server'ı ekle (token varsa)
if [ -n "$GITHUB_TOKEN" ]; then
    echo "📦 GitHub MCP Server ekleniyor..."
    
    # MCP paketini önce indir (performans için)
    npm install -g @modelcontextprotocol/server-github || echo "⚠️ MCP server kurulum başarısız, devam ediliyor..."
    
    # GitHub MCP'yi Claude'a ekle
    claude mcp add-json github "{
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@modelcontextprotocol/server-github\"],
      \"env\": {
        \"GITHUB_PERSONAL_ACCESS_TOKEN\": \"$GITHUB_TOKEN\"
      }
    }" 2>/dev/null || echo "⚠️ GitHub MCP ekleme başarısız - token'ı kontrol edin"
    
    # Context7 MCP'yi de ekle (dokümantasyon için)
    echo "📚 Context7 MCP Server ekleniyor..."
    claude mcp add-json context7 "{
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@upstash/context7-mcp@latest\"]
    }" 2>/dev/null || echo "⚠️ Context7 MCP ekleme başarısız"
    
    echo "✅ MCP Sunucuları ekleme tamamlandı!"
    
    # Kurulumu test et
    echo ""
    echo "🧪 MCP bağlantılarını test ediliyor..."
    
    if claude mcp list 2>/dev/null | grep -q "github"; then
        echo "✅ GitHub MCP başarılı"
        
        # GitHub bağlantısını test et
        if claude mcp test github 2>/dev/null; then
            echo "✅ GitHub MCP çalışıyor!"
        else
            echo "⚠️  GitHub MCP test başarısız - token'ı kontrol edin"
        fi
    else
        echo "❌ GitHub MCP kurulumu başarısız"
    fi
    
    echo ""
    echo "💻 Video Otomasyon Platformu için hazır komutlar:"
    echo "   claude 'Bu repo'daki analysis.json dosyalarını analiz et'"
    echo "   claude 'Remotion bileşenlerini \"easy, actually\" stiline uygunluk açısından incele'"
    echo "   claude 'Son commitleri göster ve video otomasyon pipeline durumunu kontrol et'"
    echo "   claude 'Feature/github-mcp-integration branch'i oluştur'"
    echo ""
    echo "📋 Kurulu MCP Sunucuları: $(claude mcp list 2>/dev/null | wc -l || echo '0') adet"
else
    echo ""
    echo "⏭️  GitHub MCP kurulumu atlandı (token yok)"
    echo "Environment variables ayarlandıktan sonra container'ı rebuild edin."
fi

echo ""
echo "🎉 DevContainer kurulumu tamamlandı!"
echo "🛡️  Güvenlik: Container izole ortamda, --dangerously-skip-permissions aktif"

# Geliştirme ortamı bilgisi
echo ""
echo "📊 Ortam Bilgisi:"
echo "   Node.js: $(node --version 2>/dev/null || echo 'Kurulacak')"
echo "   npm: $(npm --version 2>/dev/null || echo 'Kurulacak')"
echo "   Git: $(git --version 2>/dev/null || echo 'Kurulu')"
echo "   GitHub CLI: $(gh --version 2>/dev/null | head -n1 || echo 'Kurulacak')"
echo "   Claude Code: $(command -v claude >/dev/null && echo 'Kurulu' || echo 'Kuruldu')"
