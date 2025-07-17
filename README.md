# Calendário Interativo

Aplicativo de calendário interativo para controle de valores diários, desenvolvido com React, TypeScript e Electron.

## Funcionalidades

- ✅ Calendário interativo mensal
- ✅ Adicionar valores/notas para cada dia
- ✅ Navegação entre meses
- ✅ Total mensal e anual
- ✅ Persistência de dados local
- ✅ Interface responsiva
- ✅ Aplicativo desktop para Windows

## Como usar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento (web)
npm run dev

# Executar em modo desenvolvimento (Electron)
npm run electron:dev
```

### Build para produção

```bash
# Build web
npm run build

# Build aplicativo Windows
npm run electron:build

# Build apenas instalador Windows
npm run electron:build-win

# Build apenas versão portátil
npm run electron:build-portable
```

## GitHub Actions

O projeto está configurado para usar GitHub Actions para build automático:

1. Faça push do código para seu repositório GitHub
2. Crie uma tag de versão: `git tag v1.0.0 && git push origin v1.0.0`
3. O GitHub Actions irá automaticamente:
   - Fazer build do projeto
   - Gerar o executável para Windows
   - Criar um release com os arquivos

### Configuração necessária

1. **Ícone**: Adicione um arquivo `icon.ico` na pasta `public/`
2. **Package.json**: Atualize os campos `author`, `owner` e `repo` no `package.json`
3. **GitHub**: Configure o repositório no GitHub e ative as Actions

## Estrutura do projeto

```
├── src/                 # Código fonte React
├── electron/           # Código do Electron
├── public/             # Arquivos públicos
├── .github/workflows/  # GitHub Actions
├── dist/              # Build web
└── dist-electron/     # Build Electron
```

## Tecnologias

- **React 18** - Interface do usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Electron** - Aplicativo desktop
- **Vite** - Build tool
- **GitHub Actions** - CI/CD