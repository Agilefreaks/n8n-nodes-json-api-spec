import { serialize } from './serializer';

describe('serialize', () => {
	it('should serialize a resource with all attributes', () => {
		const result = serialize(
			'organization',
			'42',
			{
				name: 'Nike',
				country: 'Romania',
				region: 'Sibiu'
			}
		);

		expect(result).toEqual({
			id: '42',
			type: 'organization',
			attributes: {
				name: 'Nike',
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

	it('should serialize a resource with various data types in attributes', () => {
		const result = serialize(
			'organization',
			'3',
			{
				name: 'Puma',
				country: 'Germany',
				founded: 1948,
				active: true,
				regions: ['Europe', 'Asia'],
				metadata: { employees: 16000 }
			}
		);

		expect(result).toEqual({
			id: '3',
			type: 'organization',
			attributes: {
				name: 'Puma',
				country: 'Germany',
				founded: 1948,
				active: true,
				regions: ['Europe', 'Asia'],
				metadata: { employees: 16000 }
			}
		});
	});
});
