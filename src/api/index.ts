export const getApi = async (url: string, data: any, options?: any) => {
  return await window.Api.getApi(url, data, options)
}

export const postApi = async (url: string, data: any, options?: any) => {
  return await window.Api.postApi(url, data, options)
}