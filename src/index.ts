import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

export function createClient(url: string, options?: RequestInit) {
  const { headers, ...rest } = options || {};

  async function request<TResult, TVariables>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables?: TVariables extends Record<string, never>
      ? undefined
      : TVariables,
    requestOptions?: RequestInit,
  ): Promise<TResult> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      ...rest,
      ...requestOptions,
      body: JSON.stringify({
        query: print(document),
        variables,
      }),
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch: ${
          response.statusText
        }. Body: ${await response.text()}`,
      );
    }

    const { data } = await response.json();

    return data;
  }

  return {
    request,
  };
}
