@echo off
REM Generate Python SDK from running backend OpenAPI spec.
REM Requires: openapi-generator-cli (install: npm install -g @openapitools/openapi-generator-cli)
REM Backend must be running on http://localhost:8000

REM Ensure Java is available in this shell even before a full sign out/in.
if exist "C:\Program Files\Eclipse Adoptium" (
	for /f "delims=" %%D in ('dir /b /ad "C:\Program Files\Eclipse Adoptium" ^| sort /r') do (
		if exist "C:\Program Files\Eclipse Adoptium\%%D\bin\java.exe" (
			set "PATH=C:\Program Files\Eclipse Adoptium\%%D\bin;%PATH%"
			goto :java_ready
		)
	)
)
:java_ready

echo Generating Python SDK from OpenAPI spec...
openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o ..\voting_sdk --additional-properties=packageName=voting_sdk
echo Done. SDK generated in ..\voting_sdk
pause
