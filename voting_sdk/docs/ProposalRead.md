# ProposalRead


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **int** |  | 
**title** | **str** |  | 
**description** | **str** |  | 
**created_at** | **datetime** |  | 
**deadline** | **datetime** |  | 
**status** | [**ProposalStatus**](ProposalStatus.md) |  | 

## Example

```python
from voting_sdk.models.proposal_read import ProposalRead

# TODO update the JSON string below
json = "{}"
# create an instance of ProposalRead from a JSON string
proposal_read_instance = ProposalRead.from_json(json)
# print the JSON string representation of the object
print(ProposalRead.to_json())

# convert the object into a dict
proposal_read_dict = proposal_read_instance.to_dict()
# create an instance of ProposalRead from a dict
proposal_read_from_dict = ProposalRead.from_dict(proposal_read_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


