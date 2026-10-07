# ADR-014: Repositório do site público só para leitura, com todos os direitos reservados

- **Status:** Aceito
- **Data:** 2026-10-07
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O repositório do site vai ficar público para que qualquer pessoa leia os documentos do pipeline em `docs/sdd/`, que são a prova de que o site foi feito com o kit (RN-14). O responsável não quer que o código, os textos ou os documentos sejam copiados ou reaproveitados. O kit em si continua sob MIT, no repositório dele, e nada aqui muda isso.

## Decisão

- O repositório do site não usa licença aberta. O arquivo `LICENSE` declara **todos os direitos reservados**: o conteúdo pode ser lido e visualizado no GitHub, e nenhuma outra permissão é concedida (copiar, modificar, redistribuir, publicar ou usar exige autorização por escrito).
- O `package.json` declara `"license": "UNLICENSED"` e continua `"private": true`, para não ser publicado no npm.
- O README deixa claro que o repositório é público só para consulta e que a licença MIT citada no site é a do kit.

## Motivos

- Sem licença aberta, vale o direito autoral padrão: ninguém ganha permissão de reuso só porque o repositório é público.
- Um `LICENSE` explícito evita ambiguidade. Quem visita sabe na hora o que pode e o que não pode.
- O repositório inteiro continua visível, então os links de `docs/sdd/` (rodapé e bloco "feito com o MyAiToolKit") seguem funcionando, com o código ao lado para conferir cada tarefa.

## Opções descartadas

- **MIT ou outra licença permissiva.** Liberaria exatamente o que o responsável não quer: cópia e reuso.
- **Creative Commons BY-NC-ND.** Ainda permite copiar e redistribuir o conteúdo sem fins comerciais.
- **Repositório privado e um repositório público só com `docs/sdd/`.** Esconde o código, mas separa os documentos dos commits e do código que eles rastreiam, e exige manter dois repositórios em sincronia. Continua disponível se o responsável preferir no futuro.

## Consequências

- **Limite técnico:** um repositório público pode ser lido, baixado e clonado por qualquer pessoa, e o HTML publicado do site também é público. A licença restringe o que se pode **fazer legalmente** com o conteúdo; ela não impede tecnicamente a cópia.
- **Termos do GitHub:** ao deixar um repositório público, o dono concede a outros usuários o direito de visualizá-lo e de fazer fork pela própria plataforma. Isso não dá direito de uso, modificação ou redistribuição fora do que o `LICENSE` permite.
- **Contribuições:** sem licença aberta, contribuições externas ao site não são esperadas. Contribuições ao kit continuam no repositório do kit.
- **Marca:** os arquivos em `brand/` ficam sob a mesma reserva.

## Para quem vai implementar

- Criar `LICENSE` na raiz em pt-BR e en, com o nome do titular e o ano.
- Acrescentar `"license": "UNLICENSED"` ao `package.json`.
- Atualizar o README com uma seção "Licença".
- Tornar o repositório público é feito pelo responsável, nas configurações do GitHub.

## Referências

- GitHub Docs — Licensing a repository (sem licença, valem as leis de direito autoral padrão).
- GitHub Terms of Service, seção D.5 — License Grant to Other Users.
- npm Docs — campo `license` (`UNLICENSED` para pacotes não licenciados).
