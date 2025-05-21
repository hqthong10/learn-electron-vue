export const adminGetApi = async (url: string, data: any, options?: any) => {
  return await window.Api.providerGet(url, data, options)
}

export const adminPostApi = async (url: string, data: any, options?: any) => {
  return await window.Api.providerPost(url, data, options)
}

export const viewerGetApi = async (url: string, data: any, options?: any) => {
  return await window.Api.viewerGet(url, data, options)
}

export const viewerPostApi = async (url: string, data: any, options?: any) => {
  return await window.Api.viewerPost(url, data, options)
}