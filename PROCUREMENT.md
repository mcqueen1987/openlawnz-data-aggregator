# OpenLaw NZ Data Procurement Policy

## Introduction 

OpenLaw NZ obtains data from external providers’ websites such as the Ministry of Justice. It is vitally important to treat those providers with respect, and we must avoid heavy load on any third-party servers where we obtain data from. 

Volunteers and contractors must follow this policy when running any process or script that queries a non-OpenLaw NZ server for data.

## Principles

1.	Obtain data from approved sources only. Currently approved sources are NZ government websites only (justice.govt.nz, courts.govt.nz and similar). Before directing requests to any other server, first obtain approval from William or Andy 

2.	Download requests to approved servers must be limited to no more than one completed request per second, or a group of 10 requests every 10 seconds.

3.	The rate limit should be fleet-wide (do not spin up 10 instances which would create 10 requests per second)

4.	Data should not be downloaded from a source more than once. Therefore download from a source only where there is an appropriate and functional adapter in place for that specific source.  That will ensure data is saved to our AWS S3 bucket and entered into the appropriate openlawnz database for later parsing.
