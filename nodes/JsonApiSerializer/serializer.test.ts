import { serialize, buildPayload, type ResourceInput  } from './serializer';

describe('serialize', () => {
	it('should serialize a resource with all attributes', () => {
		const result = serialize(
			'organization',
			'42',
			{
				name: 'Agile Freaks SRL',
				country: 'Romania',
				region: 'Sibiu'
			}
		);

		expect(result).toEqual({
			id: '42',
			type: 'organization',
			attributes: {
				name: 'Agile Freaks SRL',
				country: 'Romania',
				region: 'Sibiu'
			}
		});
	});

	it('should serialize a resource with empty attributes', () => {
		const result = serialize('organization', '1', {});

		expect(result).toEqual({
			id: '1',
			type: 'organization',
			attributes: {}
		});
	});
});

describe('buildPayload', () => {
	describe('object response type', () => {
		it('should build payload for single resource', () => {
			const resources: ResourceInput[] = [
				{
					resource_type: 'organization',
					resource_id: '42',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu'
					}
				}
			];

			const result = buildPayload('object', resources);

			expect(result).toEqual({
				data: {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu'
					}
				}
			});
		});

		it('should build payload with empty attributes', () => {
			const resources: ResourceInput[] = [
				{
					resource_type: 'organization',
					resource_id: '1',
					attributes: {}
				}
			];

			const result = buildPayload('object', resources);

			expect(result).toEqual({
				data: {
					id: '1',
					type: 'organization',
					attributes: {}
				}
			});
		});
	});

	describe('array response type', () => {
		it('should build payload for multiple resources', () => {
			const resources: ResourceInput[] = [
				{
					resource_type: 'organization',
					resource_id: '1',
					attributes: { name: 'Agile Freaks SRL', country: 'USA' }
				},
				{
					resource_type: 'organization',
					resource_id: '2',
					attributes: { name: 'Agile Freaks SRL', country: 'Germany' }
				},
				{
					resource_type: 'organization',
					resource_id: '3',
					attributes: { name: 'Agile Freaks SRL', country: 'Germany' }
				}
			];

			const result = buildPayload('array', resources);

			expect(result).toEqual({
				data: [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' }
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' }
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' }
					}
				]
			});
		});

		it('should handle empty array', () => {
			const resources: ResourceInput[] = [];

			const result = buildPayload('array', resources);

			expect(result).toEqual({
				data: []
			});
		});
	});
});
