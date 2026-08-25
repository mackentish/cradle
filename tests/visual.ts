import { screen } from 'expo-router/testing-library';

type JsonNode = {
  type: string;
  props: Record<string, unknown>;
  children: (JsonNode | string)[] | null;
};

/**
 * Props worth capturing. Everything about how a screen *looks* is here — the
 * resolved styles above all — while handlers and internals stay out, since they
 * add noise without ever being the thing that regressed.
 */
const KEEP = [
  'style',
  'testID',
  'accessibilityLabel',
  'accessibilityRole',
  'accessibilityState',
  'placeholder',
  'value',
  'source',
  'fill',
  'stroke',
  'd',
];

function isNode(value: unknown): value is JsonNode {
  return typeof value === 'object' && value !== null && 'type' in value;
}

function findByTestId(node: JsonNode | string | null, testID: string): JsonNode | null {
  if (!node || typeof node === 'string') return null;
  if (node.props?.testID === testID) return node;
  for (const child of node.children ?? []) {
    const hit = findByTestId(child, testID);
    if (hit) return hit;
  }
  return null;
}

function prune(node: JsonNode | string): unknown {
  if (typeof node === 'string') return node;

  const props: Record<string, unknown> = {};
  for (const key of KEEP) {
    if (node.props && key in node.props && node.props[key] !== undefined) {
      props[key] = node.props[key];
    }
  }

  const children = (node.children ?? []).map(prune);
  return {
    type: node.type,
    ...(Object.keys(props).length ? { props } : {}),
    ...(children.length ? { children } : {}),
  };
}

/**
 * A snapshot-friendly projection of one screen.
 *
 * Taken from the screen's own subtree so the navigator stays out of the diff, and
 * pruned so a reviewer can actually read the result. These are render-tree
 * snapshots rather than pixel comparisons, but the tree carries resolved styles,
 * so a colour, radius or spacing regression still shows up.
 */
export function visualTree(testID: string): unknown {
  const root = screen.toJSON() as JsonNode | null;
  const found = findByTestId(root, testID);
  if (!found) throw new Error(`No node with testID "${testID}" was rendered`);
  return prune(found);
}

export { isNode };
