# Commit Work Item
> Link your commits to your issue/project tracking provider!

## What is it?
Commit Work Item adds additional menu options for Commit, Commit Staged, and Commit All (with amends) to the main Source Control tree.

This command will prompt you for a three part message that will resolve to the following format:

```
feat: New thing!            // short commit, include semantic keywords (optional)

The new thing does this.    // more descriptive details of the commit

#id 1010                    // the work item id corresponding to this commit
```

## Screenshots


## Releases
### v0.0.1
- Support for `#id #{workItemId}` format -- will be configurable in future releases.