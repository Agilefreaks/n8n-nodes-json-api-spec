import { NodeOperationError, type INode, type IExecuteFunctions } from 'n8n-workflow';
import { Resource } from './Types';

export function parseResource(context: IExecuteFunctions, index: number): Resource {
	const type = context.getNodeParameter('resource_type', index) as string;
	const id = context.getNodeParameter('resource_id', index) as string;
	const resource_attributes = context.getNodeParameter('resource_attributes', index) as string;
	const attributes = parseAttributes(context.getNode(), resource_attributes);

	const raw_included = context.getNodeParameter('included', 0) as any;
	const has_relationships = raw_included.resources?.length > 0;
	var relationships = [];
	if (has_relationships) {
		relationships = raw_included.resources?.map((included_resource: any) => {
			const type = included_resource.type;
			const attributes = parseAttributes(context.getNode(), included_resource.attributes);
			const id = attributes.id;
			delete attributes.id;

			return { id, type, attributes }
		});
	}

	return { id, type, attributes, relationships };
}

export function parseAttributes(node: INode, attributes: string): any {
	try {
		return JSON.parse(attributes);
	} catch (exception) {
		throw new NodeOperationError(node, 'Attributes must be a valid json');
	}
}
