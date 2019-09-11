# Building instructions
## Monitor daemon (dgpumon)
To build the monitor daemon, libczmq and cmake are required, as well as the
headers of the NVIDIA monitoring library (NVML). To build the binary executable,
please follow this instructions:

```bash
cd client
mkdir build
cd build
cmake ..
make
```

To build the DEB package:
0. Register GPG keys
1. Increase the package versions on ```CMakeLists.txt```
2. Update the changelog and add a message on ```debian/changelog```
3. Execute ```dpkg-buildpackage -rfakeroot```

For more information, please visit https://coderwall.com/p/urkybq/how-to-create-debian-package-from-source
