#import "ViewmodelsProvider.h"
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModule.h>

#import "NativeViewModelA.h"
#import "NativeViewModelB.h"

@implementation ViewmodelsProvider

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  if(params.moduleName == facebook::react::NativeViewModelA::kModuleName)
    return std::make_shared<facebook::react::NativeViewModelA>(params.jsInvoker);
  else if(params.moduleName ==  facebook::react::NativeViewModelB::kModuleName)
    return std::make_shared<facebook::react::NativeViewModelB>(params.jsInvoker);
  else return nullptr;
}

@end
