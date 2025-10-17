import { serialize, buildPayload, buildPaginationLinks, buildPaginationMeta, type ResourceInput, type PaginationInput  } from './serializer';

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

	describe('with pagination', () => {
		it('should build payload with pagination for array response', () => {
			const resources: ResourceInput[] = [
				{
					resource_type: 'organization',
					resource_id: '1',
					attributes: { name: 'Org 1' }
				},
				{
					resource_type: 'organization',
					resource_id: '2',
					attributes: { name: 'Org 2' }
				}
			];

			const pagination: PaginationInput = {
				url: 'https://api.example.com/v1/organizations',
				queryParams: {
					page: {
						number: 2,
						size: 2
					}
				},
				totalPages: 10
			};

			const result = buildPayload('array', resources, pagination);

			expect(result).toEqual({
				data: [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Org 1' }
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Org 2' }
					}
				],
				meta: {
					page: {
						current: 2,
						size: 2,
						total: 10
					}
				},
				links: {
					first: 'https://api.example.com/v1/organizations?page%5Bnumber%5D=1&page%5Bsize%5D=2',
					prev: 'https://api.example.com/v1/organizations?page%5Bnumber%5D=1&page%5Bsize%5D=2',
					next: 'https://api.example.com/v1/organizations?page%5Bnumber%5D=3&page%5Bsize%5D=2',
					last: 'https://api.example.com/v1/organizations?page%5Bnumber%5D=10&page%5Bsize%5D=2'
				}
			});
		});

		it('should build payload with pagination and custom meta', () => {
			const resources: ResourceInput[] = [
				{
					resource_type: 'organization',
					resource_id: '1',
					attributes: { name: 'Org 1' }
				}
			];

			const pagination: PaginationInput = {
				url: 'https://api.example.com/v1/organizations',
				queryParams: {
					page: {
						number: 1,
						size: 3
					}
				},
				totalPages: 100,
				customMeta: {
					total_organization_count: '62334',
					filter_applied: true
				}
			};

			const result = buildPayload('array', resources, pagination);

			expect(result.meta).toEqual({
				page: {
					current: 1,
					size: 3,
					total: 100
				},
				total_organization_count: '62334',
				filter_applied: true
			});
		});

		it('should build payload with filters preserved in pagination links', () => {
			const resources: ResourceInput[] = [
				{
					resource_type: 'organization',
					resource_id: '1',
					attributes: { name: 'Org 1' }
				}
			];

			const pagination: PaginationInput = {
				url: 'https://api.example.com/v1/organizations',
				queryParams: {
					page: {
						number: 2,
						size: 3
					},
					filter: {
						name: 'cons',
						country: 'France'
					}
				},
				totalPages: 100
			};

			const result = buildPayload('array', resources, pagination);

			// All links should contain the filters
			expect(result.links?.first).toContain('filter%5Bname%5D=cons');
			expect(result.links?.first).toContain('filter%5Bcountry%5D=France');
			expect(result.links?.next).toContain('filter%5Bname%5D=cons');
			expect(result.links?.next).toContain('filter%5Bcountry%5D=France');
		});
	});
});

describe('buildPaginationLinks', () => {
	it('should build pagination links for middle page', () => {
		const result = buildPaginationLinks(
			'https://api.example.com/v1/organizations',
			{ page: { number: 5, size: 10 } },
			20
		);

		expect(result.first).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=1&page%5Bsize%5D=10');
		expect(result.prev).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=4&page%5Bsize%5D=10');
		expect(result.next).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=6&page%5Bsize%5D=10');
		expect(result.last).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=20&page%5Bsize%5D=10');
	});

	it('should set prev to null on first page', () => {
		const result = buildPaginationLinks(
			'https://api.example.com/v1/organizations',
			{ page: { number: 1, size: 10 } },
			20
		);

		expect(result.prev).toBeNull();
		expect(result.first).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=1&page%5Bsize%5D=10');
		expect(result.next).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=2&page%5Bsize%5D=10');
	});

	it('should set next to null on last page', () => {
		const result = buildPaginationLinks(
			'https://api.example.com/v1/organizations',
			{ page: { number: 20, size: 10 } },
			20
		);

		expect(result.next).toBeNull();
		expect(result.prev).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=19&page%5Bsize%5D=10');
		expect(result.last).toBe('https://api.example.com/v1/organizations?page%5Bnumber%5D=20&page%5Bsize%5D=10');
	});

	it('should handle single page (prev and next both null)', () => {
		const result = buildPaginationLinks(
			'https://api.example.com/v1/organizations',
			{ page: { number: 1, size: 10 } },
			1
		);

		expect(result.prev).toBeNull();
		expect(result.next).toBeNull();
		expect(result.first).toBe(result.last);
	});

	it('should preserve filters in query params', () => {
		const result = buildPaginationLinks(
			'https://api.example.com/v1/organizations',
			{
				page: { number: 1, size: 3 },
				filter: { name: 'cons', country: 'France' }
			},
			100
		);

		expect(result.first).toContain('filter%5Bname%5D=cons');
		expect(result.first).toContain('filter%5Bcountry%5D=France');
		expect(result.first).toContain('page%5Bnumber%5D=1');
		expect(result.first).toContain('page%5Bsize%5D=3');
	});

	it('should work with only filters (no page in queryParams yet)', () => {
		const result = buildPaginationLinks(
			'https://api.example.com/v1/organizations',
			{
				page: { number: 1, size: 10 },
				filter: { name: 'cons' }
			},
			5
		);

		expect(result.first).toContain('page%5Bnumber%5D=1');
		expect(result.first).toContain('page%5Bsize%5D=10');
		expect(result.first).toContain('filter%5Bname%5D=cons');
	});

	it('should handle nested filters with multiple levels', () => {
		const result = buildPaginationLinks(
			'https://api.example.com/v1/organizations',
			{
				page: { number: 2, size: 10 },
				filter: {
					organization: {
						name: 'cons',
						address: {
							country: 'France'
						}
					}
				}
			},
			5
		);

		expect(result.next).toContain('filter%5Borganization%5D%5Bname%5D=cons');
		expect(result.next).toContain('filter%5Borganization%5D%5Baddress%5D%5Bcountry%5D=France');
		expect(result.next).toContain('page%5Bnumber%5D=3');
	});
});

describe('buildPaginationMeta', () => {
	it('should build meta with page info only', () => {
		const result = buildPaginationMeta(
			{ page: { number: 5, size: 10 } },
			100
		);

		expect(result).toEqual({
			page: {
				current: 5,
				size: 10,
				total: 100
			}
		});
	});

	it('should build meta with custom fields', () => {
		const result = buildPaginationMeta(
			{ page: { number: 1, size: 3 } },
			20778,
			{
				total_organization_count: '62334',
				filter_applied: true
			}
		);

		expect(result).toEqual({
			page: {
				current: 1,
				size: 3,
				total: 20778
			},
			total_organization_count: '62334',
			filter_applied: true
		});
	});

	it('should handle empty custom meta', () => {
		const result = buildPaginationMeta(
			{ page: { number: 1, size: 10 } },
			50,
			{}
		);

		expect(result).toEqual({
			page: {
				current: 1,
				size: 10,
				total: 50
			}
		});
	});

	it('should build meta with explicit page values', () => {
		const result = buildPaginationMeta(
			{ page: { number: 1, size: 10 } },
			50
		);

		expect(result).toEqual({
			page: {
				current: 1,
				size: 10,
				total: 50
			}
		});
	});
});
