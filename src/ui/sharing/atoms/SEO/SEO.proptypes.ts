export interface Props {
  title: string | null;
  description: string;
  cover: string | null;
  largeDescription?: string;
  metas: Record<string, string>[];
  metaid: string;
}
