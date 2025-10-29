import { NodeOperationError, type INode } from 'n8n-workflow';

export function parseAttributes(node: INode, attributes: string): any {
	try {
		return JSON.parse(attributes);
	} catch (exception) {
		throw new NodeOperationError(node, 'Attributes must be a valid json');
	}
}
