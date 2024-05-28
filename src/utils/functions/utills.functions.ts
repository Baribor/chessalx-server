import { HttpStatus } from '@nestjs/common';
import { BaseResponseDTO, PaginationControl } from '../types/utils.types';

export function omit<Data extends object, Keys extends keyof Data>(
  data: Data,
  keys: Keys[],
): Omit<Data, Keys> {
  const result = { ...data };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<Data, Keys>;
}

export function pick<Data extends object, Keys extends keyof Data>(
  data: Data,
  keys: Keys[],
): Pick<Data, Keys> {
  const result = {} as Pick<Data, Keys>;

  for (const key of keys) {
    result[key] = data[key];
  }

  return result;
}

export const calculatePagination = (
  count: number,
  pageSize: number,
  cursor: string | number | undefined,
): PaginationControl => {
  return {
    cursor,
    recordsPerPage: pageSize,
    totalRecords: count,
    totalPages: Math.ceil(count / pageSize),
  };
};

export const makeRequest = async ({
  body,
  url,
  method = 'GET',
  headers = {},
}: {
  body?: object;
  url: string;
  method: string;
  headers?: object;
}): Promise<BaseResponseDTO> => {
  const requestData: any = {
    headers,
    method,
  };

  if (body) {
    requestData.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, requestData);
    const data = await res.json();
    if (res.status >= HttpStatus.OK && res.status < HttpStatus.AMBIGUOUS) {
      return {
        status: true,
        message: 'OK',
        data,
      };
    }
    console.log(data);
    return {
      status: false,
      message: 'an error occurred',
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: 'an error occurred',
    };
  }
};

export const generateTransactionRef = () => {
  const now = new Date();
  return `KUN-${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}-${Math.floor(Math.random() * 999)}`;
};
