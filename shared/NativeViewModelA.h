#include "ViewmodelsSpecsJSI.h"
#include <Dense>
#include <algorithm>
#include <chrono>
#include <jsi/jsi.h>
#include <memory>
#include <prism/prism.hpp>
#include <prism/prismJson.hpp>
#include <prism/rn/prismmodellistproxy.hpp>
#include <prism/rn/prismmodelproxy.hpp>
#include <thread>

struct Mine
{
    /**
     * @brief value 真实状态
     * -1   : 未打开
     * 0    : 空
     * 1-8  : 数字
     * 9-10 : 雷
     * 11   : 旗
     * 12   : 问号
     */
    int value = -1;

    /**
     * @brief visual_value 可视状态
     * -1   : 未打开
     * 0    : 空
     * 1-8  : 数字
     * 9-10 : 雷
     * 11   : 旗
     * 12   : 问号
     */
    int visual_value = -1;

    /**
     * @brief isPressed
     * 双击旗时,未打开的格子凹下
     */
    bool isPressed = false;

    /**
     * @brief isLastPressed
     * 点击到雷
     */
    bool isLastPressed = false;
};
PRISM_FIELDS(Mine, value, visual_value, isPressed, isLastPressed);

struct MinesVM
{
    /*
     0: nf
     1: flag
     */
    int mode = 0;
    int row_num = 16;
    int col_num = 30;
    int mine_num = 99;
    int flag_num = 0;
    int eTime_ms = 0;
    /**
    0: unstarted
    1: playing
    2: finished
     */
    int status = 0;
    int cellPixcelSize = 40;

    int difficulties = 2;     // 0: easy, 1: medium, 2: hard, 3: custom
    int tmp_difficulties = 2; // 0: easy, 1: medium, 2: hard, 3: custom
    std::shared_ptr<prism::rn::PrismModelListProxy<Mine>> mines = std::make_shared<prism::rn::PrismModelListProxy<Mine>>();
};
PRISM_FIELDS(MinesVM, mode, row_num, col_num, mine_num, mines, eTime_ms, flag_num, status, cellPixcelSize, difficulties, tmp_difficulties);

namespace facebook::react
{

class JSI_EXPORT NativeViewModelA : public NativeViewModelACxxSpec<NativeViewModelA>
{

  public:
    NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker);
    ~NativeViewModelA();

    jsi::Object getMinesVm(jsi::Runtime &rt);
    void initCells(jsi::Runtime &rt);
    void regen(jsi::Runtime &rt);
    void open(jsi::Runtime &rt, int i);

  private:
    Eigen::MatrixXf conv3x3(const Eigen::MatrixXf &input, const Eigen::MatrixXf &kernel);
    void private_initCells(jsi::Runtime *rt = nullptr);
    void private_open(int i, jsi::Runtime *rt = nullptr);
    void recurse_open(int i);
    void private_regen();

  private:
    void refreshETime();
    std::atomic<bool> exitFlag = false;
    std::unique_ptr<std::thread> refreshETimeThread_ = nullptr;

    std::chrono::time_point<std::chrono::high_resolution_clock> start_;
    std::shared_ptr<prism::rn::PrismModelProxy<MinesVM>> minesVm = std::make_shared<prism::rn::PrismModelProxy<MinesVM>>();
    Eigen::MatrixXf m_kernel;
    Eigen::MatrixXf m_minesMat;
    Eigen::MatrixXf m_visualMat;
    bool m_isFirst = true;
    jsi::Runtime *rt_ = nullptr;
};

} // namespace facebook::react
// namespace facebook::react
