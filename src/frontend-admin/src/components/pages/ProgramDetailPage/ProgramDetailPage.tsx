import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {HistoryLog, IHistoryLogArray} from '../../reusables/HistoryLog/HistoryLog'
import {History} from 'history'
import {match} from 'react-router-dom'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramDetailPage.module.css'
import placeholder from '../../../content/Images/Placeholders/program-placeholder.png'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IProgramDetailPageProps {
    history: History
    match: match<{id: string}>
}

// Primary Component
export const ProgramDetailPage: React.SFC<IProgramDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken, isAdmin},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)

    const [img, setImg] = useState('')
    const [progData, setProgData] = useState<{
        name: string
        dateBought: string
        description: string
        employee: string
        employeeId: number
        icon: string
        renewalDate: string
        isCostPerYear: boolean
        flatCost: number
        costPerYear: number
    }>({
        name: '',
        dateBought: '',
        description: '',
        employee: '',
        employeeId: -1,
        icon: placeholder,
        renewalDate: '',
        isCostPerYear: false,
        flatCost: 0,
        costPerYear: 0,
    })
    const [historyList, setHistoryList] = useState<IHistoryLogArray[]>([])
    const [progRows, setProgRows] = useState<ITableItem[][]>([])
    const progHeaders = ['License Key', 'Purchase Link']

    useEffect(() => {
        axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                    dateBought: formatDate(data[0].dateBought),
                    description: format(data[0].description),
                    employee: data[0].employeeName,
                    employeeId: data[0].employeeId,
                    icon: data[0].picture,
                    renewalDate: formatDate(data[0].renewalDate),
                    isCostPerYear: data[0].isCostPerYear,
                    flatCost: data[0].programFlatCost,
                    costPerYear: data[0].programCostPerYear,
                })
                setProgRows([
                    [
                        {value: format(data[0].programLicenseKey ? data[0].programLicenseKey : '-'), sortBy: 0},
                        {value: format(data[0].programPurchaseLink), sortBy: 0},
                    ],
                ])

                setHistoryList(data[0].entries)
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(() => {
        //Check to see if the given icon string corresponds to
        //an actual image, if not display the placeholder
        if (progData.icon) {
            axios
                .get(progData.icon)
                .then((data: any) => {
                    if (data !== '') {
                        setImg(URL + progData.icon)
                    } else {
                        setImg(placeholder)
                    }
                })
                .catch((err: any) => console.error(err))
        }
    }, [progData.icon])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive this copy of ${progData.name}?`)) {
            //TODO: a post request to archive program w/ id match.params.id
            history.push(`/programs/overview/${progData.name}`)
        }
    }

    return (
        <div className={styles.progDetailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text={progData.name}
                        icon='back'
                        onClick={() => {
                            history.push(`/programs/overview/${progData.name}`)
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={img} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        {progData.flatCost > 0 && <p>Paid ------------------ ${progData.flatCost}</p>}
                        {progData.isCostPerYear ? (
                            <p>Yearly ---------------- ${progData.costPerYear}</p>
                        ) : (
                            <p>Monthly --------------- ${progData.costPerYear}</p>
                        )}
                    </div>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            <Button
                                text='Edit'
                                icon='edit'
                                onClick={() => {
                                    history.push('/editProgramDetails/' + match.params.id)
                                }}
                                className={styles.editbutton}
                            />

                            <Button
                                text='Archive'
                                icon='archive'
                                onClick={handleArchive}
                                className={styles.archivebutton}
                            />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={styles.programName}>{progData.name}</div>
                        <div className={styles.programText}>Renewal Date: {progData.renewalDate}</div>
                        <div className={styles.programText}>Purchase Date: {progData.dateBought}</div>
                        {progData.employeeId !== -1 && (
                            <div className={s(styles.programText, styles.assignedTo)}>
                                Assigned to{' '}
                                <div
                                    className={styles.empName}
                                    onClick={() => history.push(`/employees/${progData.employeeId}`)}
                                >
                                    {progData.employee}
                                </div>
                            </div>
                        )}
                    </div>

                    <DetailPageTable headers={progHeaders} rows={progRows} setRows={setProgRows} sort={false} />

                    <div className={styles.spaceBetween} />

                    <div className={styles.descriptionContainer}>
                        <div className={styles.descriptionTitle}>Description</div>
                        <div className={styles.descriptionBody}>{progData.description}</div>
                    </div>

                    <div className={styles.spaceBetween} />
                    <HistoryLog historyLog={historyList} />
                </div>
            </div>
        </div>
    )
}
