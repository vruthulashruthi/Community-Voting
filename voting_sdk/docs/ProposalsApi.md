# voting_sdk.ProposalsApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**close_proposal_proposals_proposal_id_close_patch**](ProposalsApi.md#close_proposal_proposals_proposal_id_close_patch) | **PATCH** /proposals/{proposal_id}/close | Close Proposal
[**create_proposal_proposals_post**](ProposalsApi.md#create_proposal_proposals_post) | **POST** /proposals/ | Create Proposal
[**get_proposal_proposals_proposal_id_get**](ProposalsApi.md#get_proposal_proposals_proposal_id_get) | **GET** /proposals/{proposal_id} | Get Proposal
[**list_proposals_proposals_get**](ProposalsApi.md#list_proposals_proposals_get) | **GET** /proposals/ | List Proposals
[**vote_on_proposal_proposals_proposal_id_vote_post**](ProposalsApi.md#vote_on_proposal_proposals_proposal_id_vote_post) | **POST** /proposals/{proposal_id}/vote | Vote On Proposal


# **close_proposal_proposals_proposal_id_close_patch**
> ProposalRead close_proposal_proposals_proposal_id_close_patch(proposal_id)

Close Proposal

### Example


```python
import voting_sdk
from voting_sdk.models.proposal_read import ProposalRead
from voting_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = voting_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with voting_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = voting_sdk.ProposalsApi(api_client)
    proposal_id = 56 # int | 

    try:
        # Close Proposal
        api_response = api_instance.close_proposal_proposals_proposal_id_close_patch(proposal_id)
        print("The response of ProposalsApi->close_proposal_proposals_proposal_id_close_patch:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProposalsApi->close_proposal_proposals_proposal_id_close_patch: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **proposal_id** | **int**|  | 

### Return type

[**ProposalRead**](ProposalRead.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **create_proposal_proposals_post**
> ProposalRead create_proposal_proposals_post(proposal_create)

Create Proposal

### Example


```python
import voting_sdk
from voting_sdk.models.proposal_create import ProposalCreate
from voting_sdk.models.proposal_read import ProposalRead
from voting_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = voting_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with voting_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = voting_sdk.ProposalsApi(api_client)
    proposal_create = voting_sdk.ProposalCreate() # ProposalCreate | 

    try:
        # Create Proposal
        api_response = api_instance.create_proposal_proposals_post(proposal_create)
        print("The response of ProposalsApi->create_proposal_proposals_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProposalsApi->create_proposal_proposals_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **proposal_create** | [**ProposalCreate**](ProposalCreate.md)|  | 

### Return type

[**ProposalRead**](ProposalRead.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_proposal_proposals_proposal_id_get**
> ProposalDetail get_proposal_proposals_proposal_id_get(proposal_id)

Get Proposal

### Example


```python
import voting_sdk
from voting_sdk.models.proposal_detail import ProposalDetail
from voting_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = voting_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with voting_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = voting_sdk.ProposalsApi(api_client)
    proposal_id = 56 # int | 

    try:
        # Get Proposal
        api_response = api_instance.get_proposal_proposals_proposal_id_get(proposal_id)
        print("The response of ProposalsApi->get_proposal_proposals_proposal_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProposalsApi->get_proposal_proposals_proposal_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **proposal_id** | **int**|  | 

### Return type

[**ProposalDetail**](ProposalDetail.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_proposals_proposals_get**
> List[ProposalRead] list_proposals_proposals_get()

List Proposals

### Example


```python
import voting_sdk
from voting_sdk.models.proposal_read import ProposalRead
from voting_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = voting_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with voting_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = voting_sdk.ProposalsApi(api_client)

    try:
        # List Proposals
        api_response = api_instance.list_proposals_proposals_get()
        print("The response of ProposalsApi->list_proposals_proposals_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProposalsApi->list_proposals_proposals_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[ProposalRead]**](ProposalRead.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **vote_on_proposal_proposals_proposal_id_vote_post**
> VoteRead vote_on_proposal_proposals_proposal_id_vote_post(proposal_id, vote_create)

Vote On Proposal

### Example


```python
import voting_sdk
from voting_sdk.models.vote_create import VoteCreate
from voting_sdk.models.vote_read import VoteRead
from voting_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = voting_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with voting_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = voting_sdk.ProposalsApi(api_client)
    proposal_id = 56 # int | 
    vote_create = voting_sdk.VoteCreate() # VoteCreate | 

    try:
        # Vote On Proposal
        api_response = api_instance.vote_on_proposal_proposals_proposal_id_vote_post(proposal_id, vote_create)
        print("The response of ProposalsApi->vote_on_proposal_proposals_proposal_id_vote_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProposalsApi->vote_on_proposal_proposals_proposal_id_vote_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **proposal_id** | **int**|  | 
 **vote_create** | [**VoteCreate**](VoteCreate.md)|  | 

### Return type

[**VoteRead**](VoteRead.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

