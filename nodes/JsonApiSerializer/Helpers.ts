import { NodeOperationError, type INode, type IExecuteFunctions } from 'n8n-workflow';
import { Resource } from './Types';

export function parseResource(context: IExecuteFunctions, index: number): Resource {
	const type = context.getNodeParameter('resource_type', index) as string;
	const id = context.getNodeParameter('resource_id', index) as string;
	const resource_attributes = context.getNodeParameter('resource_attributes', index) as string;
	const attributes = parseAttributes(context.getNode(), resource_attributes);

	return { id, type, attributes };
}

export function parseAttributes(node: INode, attributes: string): any {
	try {
		return JSON.parse(attributes);
	} catch (exception) {
		throw new NodeOperationError(node, 'Attributes must be a valid json');
	}
}
