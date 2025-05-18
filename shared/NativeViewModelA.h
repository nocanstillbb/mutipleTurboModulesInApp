#include "ViewmodelsSpecsJSI.h"
#include <memory>
#include <string>

namespace facebook::react {
class JSI_EXPORT NativeViewModelA :public NativeViewModelACxxSpec<NativeViewModelA>
{
  
  public :
  NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker);
  jsi::String getStr(jsi::Runtime &rt, jsi::String input);
  
};

}
// namespace facebook::react
