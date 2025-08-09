#include <iostream>
#include <jsi/jsi.h>
#include <memory>
#include <ostream>
#include <prism/rn/prismLog.h>
#include <prism/rn/prismRnJson.hpp>
#include <random>
#include <signal.h>
#include <string>
#include <thread>

#include "NativeViewModelA.h"
#include "prism/container.hpp"
#include "prism/rn/prismmodellistproxy.hpp"
#include "prism/rn/prismmodelproxy.hpp"

namespace facebook::react
{

// NativeViewModelA constructor initializes the CxxSpec with the provided jsInvoker
NativeViewModelA::NativeViewModelA(const std::shared_ptr<CallInvoker> jsInvoker) : NativeViewModelACxxSpec(std::move(jsInvoker))
{
    // raise(SIGSTOP); // 中断
    prism::Container::get()->register_instance(jsInvoker);
    this->jsInvoker_ = jsInvoker;
    private_initCells(nullptr); //初始化
    private_regen();            //生成雷

    this->refreshETimeThread_ = std::make_unique<std::thread>([this]() { refreshETime(); });
}
NativeViewModelA::~NativeViewModelA()
{
    exitFlag = true; // 设置退出标志
    if (refreshETimeThread_ && refreshETimeThread_->joinable())
        refreshETimeThread_->join(); // 等待线程结束
}

jsi::Object NativeViewModelA::getMinesVm(jsi::Runtime &rt)
{

#ifdef EIGEN_VECTORIZE
    LOG_INFO_F(rt, this->jsInvoker_, "SIMD vectorization enabled");
#endif
#ifdef EIGEN_VECTORIZE_NEON
    LOG_INFO_F(rt, this->jsInvoker_, "NEON enabled ");
#endif

    this->rt_ = &rt;

    return jsi::Object::createFromHostObject(rt, this->minesVm);
}

// 3x3 卷积函数
Eigen::MatrixXf NativeViewModelA::conv3x3(const Eigen::MatrixXf &input, const Eigen::MatrixXf &kernel)
{
    int kSize = 3; // 卷积核大小
    int pad = 1;   // 填充大小
    int rows = this->minesVm->instance()->row_num;
    int cols = this->minesVm->instance()->col_num;

    // **创建填充后的矩阵** (Zero Padding)
    Eigen::MatrixXf padded = Eigen::MatrixXf::Zero(rows + 2 * pad, cols + 2 * pad);
    padded.block(pad, pad, rows, cols) = input;

    // 输出矩阵的大小 (Valid 卷积)
    Eigen::MatrixXf output(rows, cols);

    // 遍历输入矩阵
    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            // 取出 3×3 区域
            Eigen::MatrixXf patch = padded.block(i, j, kSize, kSize);

            // 计算卷积（逐元素相乘并求和）
            output(i, j) = (patch.array() * kernel.array()).sum();
        }
    }
    return output;
}

void NativeViewModelA::private_initCells(jsi::Runtime *rt)
{

    int rows = this->minesVm->instance()->row_num;
    int cols = this->minesVm->instance()->col_num;

    m_kernel = Eigen::MatrixXf(3, 3);
    m_kernel << 1, 1, 1, 1, 0, 1, 1, 1, 1;

    m_minesMat = Eigen::MatrixXf(rows, cols);
    m_visualMat = Eigen::MatrixXf(rows, cols);

    this->minesVm->instance()->mines = std::make_shared<prism::rn::PrismModelListProxy<Mine>>();

    for (int i = 0; i < rows * cols; ++i)
    {
        this->minesVm->instance()->mines->list()->emplace_back(std::make_shared<prism::rn::PrismModelProxy<Mine>>());
    }
}

void NativeViewModelA::open(jsi::Runtime &rt, int index)
{
    private_open(index, &rt);
}

void NativeViewModelA::private_open(int index, jsi::Runtime *rt)
{
    bool isFinished = false;
    int rows = this->minesVm->instance()->row_num;
    int cols = this->minesVm->instance()->col_num;

    int row = index / cols;
    int col = index % cols;

    int v = m_minesMat(row, col);
    int visual_v = m_visualMat(row, col);

    if (this->minesVm->instance()->mode == 1) // flag mode
    {
        if (visual_v == -1) // 11: flag  12:question
        {
            m_visualMat(row, col) = 11;
        }
        else if (visual_v == 11)
        {
            m_visualMat(row, col) = 12; // 变成问号
        }
        else if (visual_v == 12)
        {
            m_visualMat(row, col) = -1; // 变成未打开
        }
        else if (visual_v >= 1 && visual_v <= 8)
        {
            // 如果是数字,则核算是否周围已标雷数是否等于数字,如果是则把其他格子全打开
            // Eigen::MatrixXf result = conv3x3((m_visualMat.array() == 11).cast<float>(), m_kernel);
            int userFlagsCount = 0;
            for (int i = 0; i < rows * cols; ++i)
            {
                int r = i / cols;
                int c = i % cols;

                if (r < row - 1 || r > row + 1 || c < col - 1 || c > col + 1)
                    continue;

                std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell = this->minesVm->instance()->mines->list()->at(i);
                //统计旗个数
                if (cell->instance()->visual_value == 11) // 11: flag
                {
                    ++userFlagsCount;
                }
            }
            if (visual_v == userFlagsCount)
            {
                // 如果周围雷数等于数字,则把其他格子全打开
                for (int i = 0; i < rows * cols; ++i)
                {
                    int r = i / cols;
                    int c = i % cols;

                    if (r < row - 1 || r > row + 1 || c < col - 1 || c > col + 1)
                        continue;

                    std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell = this->minesVm->instance()->mines->list()->at(i);

                    if (cell->instance()->visual_value == -1) // -1:未打开, 12雷
                    {
                        this->minesVm->instance()->mode ^= 1;
                        private_open(i, rt);
                        this->minesVm->instance()->mode ^= 1;
                    }
                }
            }
            else // 如果周围雷数不等于数字,则把其他格子全下沉
            {
                for (int i = 0; i < rows * cols; ++i)
                {
                    int r = i / cols;
                    int c = i % cols;

                    if (r < row - 1 || r > row + 1 || c < col - 1 || c > col + 1)
                        continue;

                    std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell = this->minesVm->instance()->mines->list()->at(i);
                    if (cell->instance()->visual_value == -1) //未打开的格子下沉
                    {
                        cell->instance()->isPressed = true;
                        cell->notifyUi(rt, "isPressed");
                    }
                }
            }
        }
    }
    else
    // if(this->minesVm->instance()->mode == 0 ) // nf mode
    {
        // 如果是非旗模式,且格子已经打开,则不处理
        if (visual_v != -1)
            return;

        if (m_isFirst)
        {
            while (v != 0)
            {
                private_regen();
                v = m_minesMat(row, col);
            }
            m_isFirst = false;
            this->minesVm->instance()->status = 1; // 设置状态为 playing
        }

        if (v == 9) //开到雷,把所有格子打开,把当前格子设置为10(红色的雷)
        {

            for (int row = 0; row < rows; ++row)
            {
                for (int col = 0; col < cols; ++col)
                {
                    {

                        int vv = m_visualMat(row, col);
                        // int v = m_minesMat(row, col);
                        if (vv != 11)
                        {
                            m_visualMat(row, col) = m_minesMat(row, col);
                        }
                    }
                }
            }
            m_visualMat(row, col) = 10;
            // isFinished = true;
            this->minesVm->instance()->status = 2; // 设置状态为 finished
            this->minesVm->notifyUi(rt, "status"); // 通知UI更新状态
        }
        else if (v == 0)
        {
            recurse_open(index);
        }
        else
        {
            m_visualMat(row, col) = m_minesMat(row, col);
        }

        int unopened = ((m_visualMat.array().cast<int>() == -1).cast<int>()).sum();
        int flag = ((m_visualMat.array().cast<int>() == 11).cast<int>()).sum();

        int mines = ((m_minesMat.array().cast<int>() == 9).cast<int>()).sum();

        if (unopened + flag == mines)
        {
            this->minesVm->instance()->status = 2; // 设置状态为 finished
            this->minesVm->notifyUi(rt, "status"); // 通知UI更新状态
            isFinished = true;
        }
    }

    for (int row = 0; row < rows; ++row)
    {
        for (int col = 0; col < cols; ++col)
        {
            std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell = this->minesVm->instance()->mines->list()->at(row * cols + col);
            int v = m_visualMat(row, col);
            if (v != cell->instance()->visual_value)
            {
                cell->instance()->visual_value = v;
                // emitOnValueChanged(row * cols + col);
                cell->notifyUi(rt, "visual_value");
            }
        }
    }
    if (isFinished)
    {
        for (int row = 0; row < rows; ++row)
        {
            for (int col = 0; col < cols; ++col)
            {
                std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell = this->minesVm->instance()->mines->list()->at(row * cols + col);
                if (cell->instance()->value == 9)
                {
                    m_visualMat(row, col) = 11;
                    cell->instance()->visual_value = 11;
                    // emitOnValueChanged(row * cols + col);
                    cell->notifyUi(rt, "visual_value");
                }
            }
        }
    }

    int flagsNumber = ((m_visualMat.array().cast<int>() == 11).cast<int>()).sum();
    if (flagsNumber != this->minesVm->instance()->flag_num)
    {
        this->minesVm->instance()->flag_num = flagsNumber;
        this->minesVm->notifyUi(rt_, "flag_num"); // 通知UI更新旗子数量
    }
    // if (m_isFirst)
    //{
    //     std::stringstream ss;
    //     for (int i = 0; i < rows; ++i)
    //     {
    //         for (int j = 0; j < cols; ++j)
    //         {
    //             ss << std::setw(4) << minesVm->instance()->mines->list()->at(i * cols + j)->instance()->value;
    //         }
    //         ss << std::endl;
    //     }
    //     std::cerr << ss.str().c_str() << std::endl;
    // }
}

void NativeViewModelA::initCells(jsi::Runtime &rt)
{
    private_initCells(&rt);
}

void NativeViewModelA::regen(jsi::Runtime &rt)
{
    private_regen();
    this->minesVm->instance()->mode = 0;  // 重置为非旗模式
    this->minesVm->notifyUi(&rt, "mode"); // 通知UI更新模式
}
void NativeViewModelA::private_regen()
{

    int rows = this->minesVm->instance()->row_num;
    int cols = this->minesVm->instance()->col_num;

    m_isFirst = true;

    std::random_device rd;                                       // 用于获取随机种子
    std::mt19937 gen(rd());                                      // Mersenne Twister 生成器
    std::uniform_int_distribution<int> dist(0, rows * cols - 1); // 生成 [0,m_rows * m_cols] 之间的整数

    m_minesMat.setConstant(-1);
    m_visualMat.setConstant(-1);

    for (std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell : *minesVm->instance()->mines->list())
    {
        cell->instance()->value = -1;
        cell->instance()->visual_value = -1;
    }

    std::set<int> values;
    for (int i = 0; i < minesVm->instance()->mine_num; ++i)
    {
    retry:
        int index = dist(gen); // 0-m_rows * m_cols
        if (values.find(index) == values.end())
        {
            values.insert(index);
            minesVm->instance()->mines->list()->at(index)->instance()->value = 9;
            m_minesMat(index / cols, index % cols) = 9;
        }
        else
            goto retry;
    }

    // std::cerr << "result  before :" << minesMat << std::endl;

    // auto start = std::chrono::high_resolution_clock::now();

    Eigen::MatrixXf result = conv3x3((m_minesMat.array() == 9).cast<float>() + (m_minesMat.array() == 10).cast<float>(), m_kernel);
    // auto after = std::chrono::high_resolution_clock::now();
    // int ms = std::chrono::duration_cast<std::chrono::milliseconds>(after - start).count();
    // if (rt_)
    //     LOG_INFO_F(*rt_, this->jsInvoker_, "卷积耗时:{}", ms);
    //  std::cerr<< "result  after :" << result << std::endl;

    for (int i = 0; i < rows * cols; ++i)
    {
        std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell = this->minesVm->instance()->mines->list()->at(i);
        int row = i / cols;
        int col = i % cols;
        int v = result(row, col);
        if (cell->instance()->value == -1)
        {
            cell->instance()->value = v;
            cell->instance()->visual_value = -1;
            m_minesMat(row, col) = v;
        }
        // emitOnValueChanged(i);
        if (this->rt_)
            cell->notifyUi(rt_, "visual_value");
    }

    this->minesVm->instance()->eTime_ms = 0;
    this->minesVm->instance()->flag_num = 0;
    this->minesVm->instance()->status = 0;
    if (rt_)
    {
        this->minesVm->notifyUi(rt_, "status");
        this->minesVm->notifyUi(rt_, "eTime_ms");
        this->minesVm->notifyUi(rt_, "flag_num");
    }

    start_ = std::chrono::high_resolution_clock::now();
}

void NativeViewModelA::recurse_open(int i)
{
    int rows = this->minesVm->instance()->row_num;
    int cols = this->minesVm->instance()->col_num;

    int row = i / cols;
    int col = i % cols;

    m_visualMat(row, col) = 0;

    Eigen::MatrixXf mask = Eigen::MatrixXf(rows, cols);
    mask.setConstant(0);
    mask(row, col) = 1;
    mask = conv3x3(mask, m_kernel);
    // mask = mask.array() * (minesMat.array() ==0).cast<float>();
    m_visualMat = mask.select(m_minesMat, m_visualMat);

    std::set<int> diff;

    for (int j = 0; j < rows * cols; ++j)
    {
        std::shared_ptr<prism::rn::PrismModelProxy<Mine>> cell = minesVm->instance()->mines->list()->at(j);
        int v = m_visualMat(j / cols, j % cols);
        if (cell->instance()->value != 9 && cell->instance()->visual_value != v)
        {
            cell->instance()->visual_value = v;
            // emitOnValueChanged(j);
            if (this->rt_)
                cell->notifyUi(rt_, "visual_value");
            if (i != j && v == 0)
            {
                diff.insert(j);
            }
        }
    }
    for (int item : diff)
    {
        recurse_open(item);
    }
}

void NativeViewModelA::refreshETime()
{
    while (!exitFlag)
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        if (this->minesVm->instance()->status == 1) // playing
        {
            auto now = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(now - start_);
            this->minesVm->instance()->eTime_ms = duration.count();
            if (this->jsInvoker_)
            {
                this->jsInvoker_->invokeAsync([&, this]() { this->minesVm->notifyUi(this->rt_, "eTime_ms"); });
            }
            else
                this->minesVm->notifyUi(this->rt_, "eTime_ms");
        }
    }
}

} // namespace facebook::react
