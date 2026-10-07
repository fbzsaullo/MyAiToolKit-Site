// Endereços externos do site (só GitHub; nada de terceiros carregado na página — RN-09).
export const KIT_REPO = 'https://github.com/fbzsaullo/MyAiToolKit';
export const KIT_LICENSE = `${KIT_REPO}/blob/main/LICENSE`;
export const KIT_CONTRIBUTING = `${KIT_REPO}/blob/main/CONTRIBUTING.md`;
export const KIT_ADAPTERS = `${KIT_REPO}/blob/main/adapters/README.md`;
export const KIT_ISSUES = `${KIT_REPO}/issues`;
export const SITE_REPO = 'https://github.com/fbzsaullo/MyAiToolKit-Site';
export const SITE_DOCS = `${SITE_REPO}/tree/main/docs/sdd`;
// Pipeline de origem, creditado no rodapé (RN-16): o único destino externo fora do projeto.
export const SDD_ORIGIN = 'https://github.com/leanwork/leanwork-sdd';

// Âncoras das seções (não se traduzem; são iguais em / e /en/).
export const NAV_SECTIONS = ['pipeline', 'rastreabilidade', 'comandos', 'arquitetura', 'instalar'] as const;
