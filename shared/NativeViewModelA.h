#include "ViewmodelsSpecsJSI.h"
#include <memory>
#include <string>

#include <prism/rn/prismmodelproxy.hpp>
#include <prism/prismJson.hpp>

struct SubClass{
  int subint = 123;
  std::string substr = "subclass";
};
PRISM_FIELDS(SubClass, subint, substr);


struct Test{
  int myint = 1133;
  double mydouble=3.1415926;
  std::shared_ptr<prism::rn::PrismModelProxy<SubClass>> sub = std::make_shared<prism::rn::PrismModelProxy<SubClass>>();
};

PRISM_FIELDS(Test,myint,mydouble,sub);

using prismModelProxy_Test = prism::rn::PrismModelProxy<Test>;

namespace facebook::react {

class JSI_EXPORT NativeViewModelA :public NativeViewModelACxxSpec<NativeViewModelA>
{
  
  public :
  NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker);
  jsi::String getStr(jsi::Runtime &rt, jsi::String input);
  jsi::Object getObj(jsi::Runtime &rt);
  void printObj(jsi::Runtime &rt);

  private:
  std::shared_ptr<prism::rn::PrismModelProxy<Test>> test_  = nullptr;
};

}
// namespace facebook::react

