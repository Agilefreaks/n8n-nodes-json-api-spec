import { JsonApiResponseBuilder } from './JsonApiResponseBuilder';
import { PaginationConfig, Resource, ResponseType } from './Types';

describe('.buildResponse', () => {
	describe('with object type', () => {
		it('returns the resource object with all attributes', () => {
			const resource = {
				id: '42',
				type: 'organization',
				attributes: {
					name: 'Agile Freaks SRL',
					country: 'Romania',
					region: 'Sibiu',
				},
			};
			const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource]);

			expect(builder.buildResponse()).toEqual({
				data: {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
				},
			});
		});

		describe('with resource having relationship', () => {
			it('returns the resource relationship and included', () => {
				const resource = {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
					relationships: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
					],
				};
				const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource], true);

				expect(builder.buildResponse()).toEqual({
					data: {
						id: '42',
						type: 'organization',
						attributes: {
							name: 'Agile Freaks SRL',
							country: 'Romania',
							region: 'Sibiu',
						},
						relationships: {
							sector: {
								data: {
									id: '42',
									type: 'sector',
								},
							}
						},
					},
					included: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
					],
				});
			});
		});

		describe('with resource having different relationships', () => {
			it('returns the resource relationship and included', () => {
				const resource = {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
					relationships: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '42',
							type: 'owner',
							attributes: {
								name: 'Boss',
							},
						},
					],
				};
				const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource], true);

				expect(builder.buildResponse()).toEqual({
					data: {
						id: '42',
						type: 'organization',
						attributes: {
							name: 'Agile Freaks SRL',
							country: 'Romania',
							region: 'Sibiu',
						},
						relationships: {
							sector:  {
								data: {
									id: '42',
									type: 'sector',
								},
							},
							owner: {
								data: {
									id: '42',
									type: 'owner',
								}
							},
						},
					},
					included: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '42',
							type: 'owner',
							attributes: {
								name: 'Boss',
							},
						},
					],
				});
			});
		});

		describe('with resource having different relationship name then resource type', () => {
			it('returns the resource relationship and included', () => {
				const resource = {
					id: '42',
					type: 'contact',
					attributes: {
						name: 'Mister Daniel'
					},
					relationships: [
						{
							id: '42',
							type: 'organization',
							relationshipName: 'membership',
							attributes: {
								name: 'Agile Freaks SRL',
								country: 'Romania',
								region: 'Sibiu'
							},
						},
					],
				};
				const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource], true);

				expect(builder.buildResponse()).toEqual({
					data: {
						id: '42',
						type: 'contact',
						attributes: {
							name: 'Mister Daniel'
						},
						relationships: {
							membership: {
								data: {
									id: '42',
									type: 'organization'
								},
							}
						},
					},
					included: [
						{
							id: '42',
							type: 'organization',
							attributes: {
								name: 'Agile Freaks SRL',
								country: 'Romania',
								region: 'Sibiu'
							},
						},
					],
				});
			});
		});

		describe('with resource having invalid relationship', () => {
			it('returns the resource relationship and included', () => {
				const resource = {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
					relationships: [
						{
							id: null,
							type: 'sector',
							attributes: {
								name: null,
							},
						},
					],
				} as unknown as Resource;
				const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource], true);

				expect(builder.buildResponse()).toEqual({
					data: {
						id: '42',
						type: 'organization',
						attributes: {
							name: 'Agile Freaks SRL',
							country: 'Romania',
							region: 'Sibiu',
						},
						relationships: {
							sector: {
								data: null
							}
						},
					},
					included: [],
				});
			});
		});
	});

	describe('with array type', () => {
		it('returns resource array with all their attributes', () => {
			const resources = [
				{
					id: '1',
					type: 'organization',
					attributes: { name: 'Agile Freaks SRL', country: 'USA' },
				},
				{
					id: '2',
					type: 'organization',
					attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
				},
				{
					id: '3',
					type: 'organization',
					attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
				},
			];

			const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources);

			expect(builder.buildResponse()).toEqual({
				data: [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
					},
				],
			});
		});

		describe('with resources having relationships', () => {
			it('returns the resource relationship and included', () => {
				const resources = [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '2',
								type: 'sector',
								attributes: {
									name: 'Software',
								},
							},
						],
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '3',
								type: 'sector',
								attributes: {
									name: 'Food Industry',
								},
							},
						],
					},
				];

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, true);

				expect(builder.buildResponse()).toEqual({
					data: [
						{
							id: '1',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'USA' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '2',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '2',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '3',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '3',
										type: 'sector',
									},
								}
							},
						},
					],
					included: [
						{
							id: '1',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '2',
							type: 'sector',
							attributes: {
								name: 'Software',
							},
						},
						{
							id: '3',
							type: 'sector',
							attributes: {
								name: 'Food Industry',
							},
						},
					],
				});
			});
		});

		describe('with resources having the same relationship', () => {
			it('returns the resource relationship and included', () => {
				const resources = [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
				];

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, true);

				expect(builder.buildResponse()).toEqual({
					data: [
						{
							id: '1',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'USA' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '2',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '3',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
					],
					included: [
						{
							id: '1',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
					],
				});
			});
		});

		describe('with resources having the different relationships', () => {
			it('returns the resource relationship and included', () => {
				const resources = [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
							{
								id: '1',
								type: 'owner',
								attributes: {
									name: 'Boss',
								},
							},
						],
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
							{
								id: '1',
								type: 'owner',
								attributes: {
									name: 'Boss',
								},
							},
						],
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
							{
								id: '1',
								type: 'owner',
								attributes: {
									name: 'Boss',
								},
							},
						],
					},
				];

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, true);

				expect(builder.buildResponse()).toEqual({
					data: [
						{
							id: '1',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'USA' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								},
								owner:  {
									data: {
										id: '1',
										type: 'owner',
									},
								}
							},
						},
						{
							id: '2',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								},
								owner:  {
									data: {
										id: '1',
										type: 'owner',
									},
								}
							},
						},
						{
							id: '3',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								},
								owner:  {
									data: {
										id: '1',
										type: 'owner',
									},
								}
							},
						},
					],
					included: [
						{
							id: '1',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '1',
							type: 'owner',
							attributes: {
								name: 'Boss',
							},
						},
					],
				});
			});
		});

		describe('with pagination', () => {
			it('returns resource array with pagination links and meta', () => {
				const resources = [
					{
						id: '1',
						type: 'contact',
						attributes: { name: 'Contact 1' },
					},
					{
						id: '2',
						type: 'contact',
						attributes: { name: 'Contact 2' },
					},
					{
						id: '3',
						type: 'contact',
						attributes: { name: 'Contact 3' },
					},
				];

				const pagination: PaginationConfig = {
					enabled: true,
					baseUrl: 'http://localhost:5678/webhook/v1/contacts',
					page: 2,
					perPage: 200,
					totalResourceCount: 800,
				};

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, false, pagination);

				expect(builder.buildResponse()).toEqual({
					data: [
						{ id: '1', type: 'contact', attributes: { name: 'Contact 1' } },
						{ id: '2', type: 'contact', attributes: { name: 'Contact 2' } },
						{ id: '3', type: 'contact', attributes: { name: 'Contact 3' } },
					],
					links: {
						first: 'http://localhost:5678/webhook/v1/contacts?page=1&per_page=200',
						prev: 'http://localhost:5678/webhook/v1/contacts?page=1&per_page=200',
						next: 'http://localhost:5678/webhook/v1/contacts?page=3&per_page=200',
						last: 'http://localhost:5678/webhook/v1/contacts?page=4&per_page=200',
					},
					meta: {
						page: {
							current: 2,
							size: 200,
							total: 4,
						},
						total_contact_count: 800,
					},
				});
			});

			it('returns null for prev on first page', () => {
				const resources = [{ id: '1', type: 'contact', attributes: { name: 'Contact 1' } }];
				const pagination: PaginationConfig = {
					enabled: true,
					baseUrl: 'http://localhost:5678/webhook/v1/contacts',
					page: 1,
					perPage: 200,
					totalResourceCount: 800,
				};

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, false, pagination);
				const response = builder.buildResponse();

				expect(response.links?.prev).toBeNull();
				expect(response.links?.first).toBe('http://localhost:5678/webhook/v1/contacts?page=1&per_page=200');
			});

			it('returns null for next on last page', () => {
				const resources = [{ id: '1', type: 'contact', attributes: { name: 'Contact 1' } }];
				const pagination: PaginationConfig = {
					enabled: true,
					baseUrl: 'http://localhost:5678/webhook/v1/contacts',
					page: 4,
					perPage: 200,
					totalResourceCount: 800,
				};

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, false, pagination);
				const response = builder.buildResponse();

				expect(response.links?.next).toBeNull();
				expect(response.links?.last).toBe('http://localhost:5678/webhook/v1/contacts?page=4&per_page=200');
			});

			it('returns null for both prev and next on single page', () => {
				const resources = [{ id: '1', type: 'contact', attributes: { name: 'Contact 1' } }];
				const pagination: PaginationConfig = {
					enabled: true,
					baseUrl: 'http://localhost:5678/webhook/v1/contacts',
					page: 1,
					perPage: 200,
					totalResourceCount: 50,
				};

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, false, pagination);
				const response = builder.buildResponse();

				expect(response.links?.prev).toBeNull();
				expect(response.links?.next).toBeNull();
				expect(response.links?.first).toBe('http://localhost:5678/webhook/v1/contacts?page=1&per_page=200');
				expect(response.links?.last).toBe('http://localhost:5678/webhook/v1/contacts?page=1&per_page=200');
			});

			it('preserves existing query params in baseUrl', () => {
				const resources = [{ id: '1', type: 'contact', attributes: { name: 'Contact 1' } }];
				const pagination: PaginationConfig = {
					enabled: true,
					baseUrl: 'http://localhost:5678/webhook/v1/contacts',
					page: 2,
					perPage: 50,
					totalResourceCount: 500,
				};

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, false, pagination);
				const response = builder.buildResponse();

				expect(response.links?.first).toContain('page=1');
				expect(response.links?.first).toContain('per_page=50');
			});

			it('preserves additional url params from queryParams', () => {
				const resources = [{ id: '1', type: 'contact', attributes: { name: 'Contact 1' } }];
				const pagination: PaginationConfig = {
					enabled: true,
					baseUrl: 'http://localhost:5678/webhook/v1/contacts',
					page: 2,
					perPage: 50,
					totalResourceCount: 500,
					queryParams: {
						filter: { organization_id: '42' },
						sort: 'name',
						page: 2,
						per_page: 50,
					},
				};

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, false, pagination);
				const response = builder.buildResponse();

				expect(response.links?.first).toContain('filter%5Borganization_id%5D=42');
				expect(response.links?.first).toContain('sort=name');
				expect(response.links?.first).toContain('page=1');
				expect(response.links?.first).toContain('per_page=50');
			});

			it('does not add links or meta when pagination not provided', () => {
				const resources = [{ id: '1', type: 'contact', attributes: { name: 'Contact 1' } }];
				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, false);
				const response = builder.buildResponse();

				expect(response.links).toBeUndefined();
				expect(response.meta).toBeUndefined();
			});
		});

		describe('with all features enabled: pagination and relationships', () => {
			it("'returns resource array with pagination links and meta, relationships and included", () => {
				const resources = [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '2',
								type: 'sector',
								attributes: {
									name: 'Software',
								},
							},
						],
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '3',
								type: 'sector',
								attributes: {
									name: 'Food Industry',
								},
							},
						],
					},
				];

				const pagination: PaginationConfig = {
					enabled: true,
					baseUrl: 'http://localhost:5678/webhook/v1/organizations',
					page: 2,
					perPage: 200,
					totalResourceCount: 800,
				};

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, true, pagination);

				expect(builder.buildResponse()).toEqual({
					data: [
						{
							id: '1',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'USA' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '2',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '2',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '3',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '3',
										type: 'sector',
									},
								}
							},
						},
					],
					included: [
						{
							id: '1',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '2',
							type: 'sector',
							attributes: {
								name: 'Software',
							},
						},
						{
							id: '3',
							type: 'sector',
							attributes: {
								name: 'Food Industry',
							},
						},
					],
					links: {
						first: 'http://localhost:5678/webhook/v1/organizations?page=1&per_page=200',
						prev: 'http://localhost:5678/webhook/v1/organizations?page=1&per_page=200',
						next: 'http://localhost:5678/webhook/v1/organizations?page=3&per_page=200',
						last: 'http://localhost:5678/webhook/v1/organizations?page=4&per_page=200',
					},
					meta: {
						page: {
							current: 2,
							size: 200,
							total: 4,
						},
						total_organization_count: 800,
					},
				});
			});
		});
	});
});
