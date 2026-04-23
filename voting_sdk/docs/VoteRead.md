# VoteRead


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **int** |  | 
**proposal_id** | **int** |  | 
**voter_name** | **str** |  | 
**vote** | [**VoteChoice**](VoteChoice.md) |  | 
**voted_at** | **datetime** |  | 

## Example

```python
from voting_sdk.models.vote_read import VoteRead

# TODO update the JSON string below
json = "{}"
# create an instance of VoteRead from a JSON string
vote_read_instance = VoteRead.from_json(json)
# print the JSON string representation of the object
print(VoteRead.to_json())

# convert the object into a dict
vote_read_dict = vote_read_instance.to_dict()
# create an instance of VoteRead from a dict
vote_read_from_dict = VoteRead.from_dict(vote_read_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


