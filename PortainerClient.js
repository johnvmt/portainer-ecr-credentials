const request = require('request');

// API examples: https://gist.github.com/deviantony/77026d402366b4b43fa5918d41bc42f8

class PortainerClient {
	constructor(apiHost, username, password) {
		this._apiHost = apiHost.replace(/\/$/, '');
		this._username = username;
		this._password = password;
		this._authToken = null;
	}

	async callApiWithKey(requestmethod, apiPath, requestData) {
		const self = this;

		return new Promise(async function(resolve, reject) {
			try {
				if (self._authToken === null)
					await self.setAuthToken();

				resolve(await self.callApi(requestmethod, apiPath, requestData, postHeaders()));
			}
			catch (error) {
				try {
					await self.setAuthToken();
					resolve(await self.callApi(requestmethod, apiPath, requestData, postHeaders()));
				}
				catch (error) {
					reject(error);
				}
			}
		});

		function postHeaders() {
			return {
				Authorization: 'Bearer ' + self._authToken
			};
		}
	}

	async callApi(requestMethod, apiPath, requestData, requestHeaders) {
		const self = this;

		return new Promise(async function(resolve, reject) {

			let requestParams = {
				method: requestMethod.toUpperCase(),
				url: self._apiHost + apiPath,
				json: (typeof requestData === 'object') ? requestData : true
			};

			if(typeof requestHeaders === 'object' && requestHeaders !== null)
				requestParams.headers = requestHeaders;

			request(requestParams, function(error, response, body) {
				if(error)
					reject(error);
				else if(response && response.statusCode === 200)
					resolve(body);
				else
					reject(response.statusCode);
			});
		})
	}

	async setAuthToken() {
		const self = this;

		return new Promise(async function(resolve, reject) {
			try {
				let authData = await self.callApi('POST', '/api/auth', {
					username: self._username,
					password: self._password
				});

				self._authToken = authData.jwt;
				resolve(self._authToken);
			}
			catch(error) {
				reject(error);
			}
		});
	}
}

module.exports = PortainerClient;