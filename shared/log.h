#ifndef HBBLOG
#define HBBLOG

#if __ANDROID__
  #include <android/log.h>
  #define HBBLOG_TAG "TurboModule"
  #define LOG_INFO(...) __android_log_print(ANDROID_LOG_INFO, HBBLOG_TAG, __VA_ARGS__)
  #define LOG_ERROR(...) __android_log_print(ANDROID_LOG_ERROR, HBBLOG_TAG, __VA_ARGS__)

#elif __APPLE__
  #include <TargetConditionals.h>
  #if TARGET_OS_IPHONE

    #ifdef __OBJC__
      // 只有在 Objective-C/Objective-C++ 编译器中才允许用 NSLog
      #import <Foundation/Foundation.h>
      #define LOG_INFO(...) NSLog(__VA_ARGS__)
      #define LOG_ERROR(...) NSLog(__VA_ARGS__)
    #else
      // 纯 C++ 模式时不允许 NSString/@
      #define LOG_INFO(...) printf(__VA_ARGS__)
      #define LOG_ERROR(...) fprintf(stderr, __VA_ARGS__)
    #endif

  #else
    #define LOG_INFO(...) printf(__VA_ARGS__)
    #define LOG_ERROR(...) fprintf(stderr, __VA_ARGS__)
  #endif

#else
  #define LOG_INFO(...) printf(__VA_ARGS__)
  #define LOG_ERROR(...) fprintf(stderr, __VA_ARGS__)
#endif

#endif // HBBLOG
