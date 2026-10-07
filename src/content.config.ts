// Coleções de conteúdo validadas no build (ADR-006).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ID_PATTERN } from './lib/ids';

// Texto nos dois idiomas.
const localized = z.object({ 'pt-BR': z.string().min(1), en: z.string().min(1) });

const id = z.string().regex(ID_PATTERN, 'ID fora dos formatos do kit');

const createdId = z.object({
  id,
  label: localized,
  parent: id.nullable(),
});

const phase = z.object({
  phase: z.number().int().min(1).max(6),
  used: z.boolean(),
  command: z.string().regex(/^\/(sdd-[a-z]+|spike|code-review)$/),
  input: localized,
  document: z.object({
    path: z.string(),
    lines: z.array(localized).min(1),
  }),
  ids: z.array(createdId),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const task = z.object({
  id,
  title: localized,
  // Apontamento que fez a tarefa voltar uma vez antes de fechar (laço execução ⇄ review).
  finding: z
    .object({
      id,
      severity: z.enum(['Bloqueante', 'Importante', 'Sugestão']),
      text: localized,
    })
    .nullable(),
});

const matrixRow = z.object({
  rn: id,
  rule: localized,
  ca: z.array(id),
  ui: z.array(id),
  tasks: z.array(id),
  tests: z.array(z.string()),
  broken: localized.nullable(),
});

const examples = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/examples' }),
  schema: z.object({
    order: z.number().int(),
    startOption: z.enum(['A', 'B']),
    entryPhase: z.number().int().min(1).max(2),
    tab: localized,
    title: localized,
    summary: localized,
    phases: z.array(phase).length(6),
    loop: z.object({ tasks: z.array(task).min(3) }),
    trace: z
      .object({
        chain: z.array(z.object({ id: z.string(), kind: z.enum(['rn', 'ca', 'ui', 't', 'r', 'test']), label: localized })),
        matrix: z.array(matrixRow),
      })
      .nullable(),
  }),
});

// Textos de interface por idioma: um arquivo por idioma, mesmas chaves (verificado em teste).
const ui = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/ui' }),
  schema: z.record(z.string(), z.unknown()),
});

export const collections = { examples, ui };

