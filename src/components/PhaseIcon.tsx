// Os seis ícones próprios das fases, no grid de 24 px a partir do módulo quadrado (SPEC-UI §5).
// Componente Preact: usado tanto em páginas Astro (sem hidratar) quanto dentro das ilhas.
type Props = { phase: number; size?: number; class?: string };

export default function PhaseIcon({ phase, size = 24, class: className }: Props) {
  return (
    <svg
      class={['phase-icon', className].filter(Boolean).join(' ')}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="square"
      stroke-linejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {phase === 1 && (
        // arquitetura: blocos empilhados
        <>
          <rect x="4" y="14" width="16" height="6" />
          <rect x="6" y="8" width="12" height="6" />
          <rect x="8" y="2" width="8" height="6" />
        </>
      )}
      {phase === 2 && (
        // requisitos: lista com marcadores quadrados
        <>
          <rect x="3" y="4" width="3" height="3" fill="currentColor" stroke="none" />
          <path d="M9 5.5h12" />
          <rect x="3" y="10.5" width="3" height="3" fill="currentColor" stroke="none" />
          <path d="M9 12h12" />
          <rect x="3" y="17" width="3" height="3" fill="currentColor" stroke="none" />
          <path d="M9 18.5h8" />
        </>
      )}
      {phase === 3 && (
        // interface: moldura de tela
        <>
          <rect x="2" y="4" width="20" height="16" />
          <path d="M2 8h20" />
          <rect x="5" y="5.25" width="1.5" height="1.5" fill="currentColor" stroke="none" />
        </>
      )}
      {phase === 4 && (
        // plano: checklist
        <>
          <rect x="3" y="3" width="6" height="6" />
          <path d="M4.5 6l1.5 1.5 3-3" />
          <path d="M12 6h9" />
          <rect x="3" y="15" width="6" height="6" />
          <path d="M12 18h9" />
        </>
      )}
      {phase === 5 && (
        // execução: prompt e cursor em bloco
        <>
          <path d="M3 6l6 6-6 6" />
          <rect x="12" y="15" width="8" height="5" fill="currentColor" stroke="none" />
        </>
      )}
      {phase === 6 && (
        // review: lupa quadrada com verificação
        <>
          <rect x="3" y="3" width="13" height="13" />
          <path d="M6.5 9.5l2.5 2.5 4-5" />
          <path d="M16 16l5 5" />
        </>
      )}
    </svg>
  );
}
