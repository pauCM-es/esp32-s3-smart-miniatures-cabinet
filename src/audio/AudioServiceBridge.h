#pragma once

#ifdef __cplusplus
extern "C"
{
#endif

/**
 * C-compatible wrapper for SquareLine-generated C event files.
 */
void audio_service_start_test(void);

/**
 * Requests cancellation of the current audio operation.
 */
void audio_service_cancel(void);

#ifdef __cplusplus
}
#endif