export interface Props {
	title?: string;
	fullTitle?: string;
	description?: string;
	cover?: string;
	coverAlt?: string;
	shared?: string;
	schema?: Record<string, unknown>;
	metas?: Record<string, string>[];
	metaid?: string;
}
