#include "NativeViewModelA.h"
#include "log.h"

namespace facebook::react {

NativeViewModelA::NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker)
: NativeViewModelACxxSpec(std::move(jsInvoker)) {}

jsi::String NativeViewModelA::getStr(jsi::Runtime &rt, jsi::String input)
{
  LOG_ERROR("get string with native view model A");
  return input;
}

} // namespace facebook::react
