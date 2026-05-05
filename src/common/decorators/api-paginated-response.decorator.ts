import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

class PaginationMetaDto {
  itemCount!: number;
  totalItems!: number;
  itemsPerPage!: number;
  totalPages!: number;
  currentPage!: number;
}

export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
) {
  return applyDecorators(
    ApiExtraModels(model, PaginationMetaDto),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          meta: {
            $ref: getSchemaPath(PaginationMetaDto),
          },
        },
      },
    }),
  );
}
