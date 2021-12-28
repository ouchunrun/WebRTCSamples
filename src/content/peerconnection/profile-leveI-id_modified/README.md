# Test of resolutions control on Edge! only Edge Test

The purpose of this repository is to test the implementation of `resolutions` in MS Edge.

here is something to know before u test it:

- when u set local_profile_level and remote_profile_level at the same time and local value smaller than the
remote value,the value of the remote is determined by local.

- Only supports resolutions, frame rates within the range of native device capabilities.

- you can test on chrome : chrome://media-internals/