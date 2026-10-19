# Guia de Implantação e Manutenção em Servidor / VM (Linux Ubuntu)

Este guia documenta detalhadamente todos os passos para provisionar, implantar, proteger e manter o **Limbus** em uma Máquina Virtual (VM) com Linux Ubuntu Server para operação corporativa ininterrupta (24/7).

---

## 🖥️ 1. Ambiente do Servidor de Produção

- **Sistema Operacional:** Ubuntu 24.04 LTS (ou 22.04 LTS)
- **IP Privado Corporativo:** `172.16.254.50`
- **Domínio Interno:** `limbus.maisinternet.com.br`
- **Usuário de Sistema:** `guilherme` (com privilégios `sudo`)
- **Portas Abertas na VM:**
  - `22` (SSH - Acesso Administrativo)
  - `80` (HTTP - Redirecionamento automático)
  - `443` (HTTPS - Acesso Seguro Criptografado com SSL)
  - `3000` (Docker Container Interno)

---

## 🐳 2. Instalação e Preparação do Docker

No terminal SSH da VM, execute os comandos para instalar o Docker Engine e o Docker Compose:

```bash
# 1. Atualizar repositórios do sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências necessárias
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. Adicionar repositório oficial do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Instalar Docker e Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. Adicionar o usuário atual ao grupo docker (para rodar docker sem sudo)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📥 3. Clonagem do Repositório e Configuração do Ambiente

1. Clone o repositório oficial na pasta `home` do usuário:
   ```bash
   cd ~
   git clone -b feature/corporate-deployment https://github.com/GuiZero777/Limbus.git
   cd Limbus
   ```

2. Crie o arquivo de variáveis de ambiente do backend:
   ```bash
   nano backend/.env
   ```
   *Cole a configuração com a chave mestra e as credenciais do Supabase Cloud:*
   ```env
   ADMIN_SECRET=senha_super_secreta_admin_limbus_123
   SUPABASE_URL=https://axlxclegbcqnjntexqta.supabase.co
   SUPABASE_KEY=sb_publishable_qENNwRQSpIkgXyuLiN3QkQ_u-bHga4X
   ```
   *(Pressione `Ctrl + O`, `Enter` para salvar e `Ctrl + X` para sair).*

3. Suba o container Docker pela primeira vez:
   ```bash
   docker compose up -d --build
   ```

---

## 🌐 4. Configuração do Nginx (Proxy Reverso) & Certificado SSL

O Nginx é responsável por interceptar o tráfego corporativo nas portas 80/443 e encaminhar internamente para o container Docker na porta 3000, além de forçar a criptografia HTTPS.

### 4.1. Instalação do Nginx
```bash
sudo apt update
sudo apt install -y nginx openssl
```

### 4.2. Geração do Certificado SSL Interno (com extensão SAN)
Modernos navegadores (Google Chrome, Edge) exigem o campo `Subject Alternative Name (SAN)` para validar conexões HTTPS locais.

Gere o certificado corporativo válido por 10 anos:
```bash
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout /etc/ssl/private/limbus.key \
  -out /etc/ssl/certs/limbus.crt \
  -subj "/C=BR/ST=SP/L=MaisInternet/O=TI/CN=limbus.maisinternet.com.br" \
  -addext "subjectAltName=DNS:limbus.maisinternet.com.br,IP:172.16.254.50"
```

### 4.3. Criação da Configuração do Site no Nginx
Crie o arquivo de configuração do Limbus:
```bash
sudo nano /etc/nginx/sites-available/limbus
```

Cole o seguinte conteúdo:
```nginx
# Redirecionamento forçado de HTTP (porta 80) para HTTPS (porta 443)
server {
    listen 80;
    server_name limbus.maisinternet.com.br 172.16.254.50;
    return 301 https://$host$request_uri;
}

# Servidor Seguro HTTPS (porta 443)
server {
    listen 443 ssl;
    server_name limbus.maisinternet.com.br 172.16.254.50;

    ssl_certificate /etc/ssl/certs/limbus.crt;
    ssl_certificate_key /etc/ssl/private/limbus.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.4. Ativação e Reinicialização do Nginx
```bash
# Ativa o site do Limbus
sudo ln -s /etc/nginx/sites-available/limbus /etc/nginx/sites-enabled/

# Remove o site default do Nginx
sudo rm -f /etc/nginx/sites-enabled/default

# Testa a sintaxe
sudo nginx -t

# Reinicia o serviço Nginx
sudo systemctl restart nginx
```

---

## 📡 5. Configuração do Domínio no DNS da Empresa

Para que todos os computadores da empresa acessem digitando `https://limbus.maisinternet.com.br`:

No servidor DNS local da empresa (MikroTik Static DNS, Windows Server Active Directory DNS, Pi-hole ou Firewall):
- **Tipo:** `A`
- **Host / Nome:** `limbus.maisinternet.com.br` (ou `limbus`)
- **Endereço IP:** `172.16.254.50`

> 💡 **Para testar em uma máquina individual antes da alteração no DNS da rede:**
> No Windows, edite `C:\Windows\System32\drivers\etc\hosts` como Administrador e adicione:
> `172.16.254.50 limbus.maisinternet.com.br`

---

## 🔄 6. Procedimento de Atualização Contínua (Deploy Rápido)

Graças à configuração de **Volume Mount** (`.:/app`) no `docker-compose.yml`, o container lê os arquivos de código diretamente do disco da VM.

### Quando houver novas alterações no GitHub:
Basta rodar **1 comando** no terminal da VM:

```bash
cd ~/Limbus
git pull origin feature/corporate-deployment
```

* **Alterações de Frontend (Telas, JavaScript, CSS, HTML):** Entram no ar **imediatamente** após o `git pull`! Basta dar `F5` no navegador.
* **Alterações de Backend (Rotas da API, servidor):** Basta reiniciar o serviço em 1 segundo:
  ```bash
  docker compose restart limbus
  ```

---

## 🔍 7. Monitoramento, Logs e Diagnóstico

### Ver status do container:
```bash
docker compose ps
```

### Ver logs em tempo real (requisições, erros, inicialização):
```bash
docker compose logs -f
```
*(Pressione `Ctrl + C` para sair dos logs).*

### Reiniciar todos os serviços:
```bash
docker compose restart
sudo systemctl restart nginx
```

### Testar resposta interna da API:
```bash
curl http://localhost:3000/api/empresas
```
