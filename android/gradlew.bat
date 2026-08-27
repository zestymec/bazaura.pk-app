@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem
@rem SPDX-License-Identifier: Apache-2.0
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows (Enhanced Dynamic JDK Resolution)
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem 1. Check existing JAVA_HOME if valid
if defined JAVA_HOME (
    set "CLEAN_JAVA_HOME=%JAVA_HOME:"=%"
    if exist "!CLEAN_JAVA_HOME!\bin\java.exe" (
        set "JAVA_HOME=!CLEAN_JAVA_HOME!"
        set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
        goto execute
    )
    if exist "%JAVA_HOME%\bin\java.exe" (
        set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
        goto execute
    )
)

@rem 2. Check java in PATH
where.exe java >NUL 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('where.exe java 2^>NUL') do (
        if exist "%%i" (
            set "JAVA_EXE=%%i"
            goto execute
        )
    )
)

@rem 3. Check Android Studio Bundled JBR / JRE
if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    set "JAVA_EXE=C:\Program Files\Android\Android Studio\jbr\bin\java.exe"
    goto execute
)
if exist "C:\Program Files\Android\Android Studio\jre\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
    set "JAVA_EXE=C:\Program Files\Android\Android Studio\jre\bin\java.exe"
    goto execute
)

@rem 4. Check Adoptium / Eclipse Temurin
for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk*") do (
    if exist "%%d\bin\java.exe" (
        set "JAVA_HOME=%%d"
        set "JAVA_EXE=%%d\bin\java.exe"
        goto execute
    )
)

@rem 5. Check Microsoft JDK
for /d %%d in ("C:\Program Files\Microsoft\jdk*") do (
    if exist "%%d\bin\java.exe" (
        set "JAVA_HOME=%%d"
        set "JAVA_EXE=%%d\bin\java.exe"
        goto execute
    )
)

@rem 6. Check Standard Oracle / OpenJDK in Program Files
for /d %%d in ("C:\Program Files\Java\jdk*") do (
    if exist "%%d\bin\java.exe" (
        set "JAVA_HOME=%%d"
        set "JAVA_EXE=%%d\bin\java.exe"
        goto execute
    )
)

@rem If we reached here, java command not found
echo. 1>&2
echo ERROR: A valid JDK could not be located on this machine. 1>&2
echo Please ensure JDK 17 or JDK 21 (or Android Studio) is installed. 1>&2
echo. 1>&2
goto fail

:execute
@rem Setup the command line
set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar

@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
@rem End local scope for the variables with windows NT shell
if %ERRORLEVEL% equ 0 goto mainEnd

:fail
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
if not ""=="%GRADLE_EXIT_CONSOLE%" exit %EXIT_CODE%
exit /b %EXIT_CODE%

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
