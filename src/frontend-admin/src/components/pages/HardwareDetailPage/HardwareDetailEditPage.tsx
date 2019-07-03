import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {IoMdAdd} from 'react-icons/io'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {HistoryLog} from '../../reusables/HistoryLog/HistoryLog'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './HardwareDetailEditPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IHardwareDetailEditPageProps {
    history: any
    match: any
}

// Primary Component
export const HardwareDetailEditPage: React.SFC<IHardwareDetailEditPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [hardwareData, setUserData] = useState<any>({})

    //default
    const [firstSectionHeaders, setFirstSectionHeaders] = useState<string[]>(['yeah something went wrong'])
    const [secondSectionHeaders, setSecondSectionHeaders] = useState<string[]>(['yeah something went wrong'])
    const [thirdSectionHeaders, setThirdSectionHeaders] = useState<string[]>(['yeah something went wrong'])
    const [headingInfo, setHeadingInfo] = useState<(string | number)[]>(['something aint right'])

    const [firstSectionData, setFirstSectionData] = useState<(string | number)[]>([])
    const [secondSectionData, setSecondSectionData] = useState<(string | number)[]>([])
    const [thirdSectionData, setThirdSectionData] = useState<(string | number)[]>([])

    const [commentText, setCommentText] = useState('')

    useEffect(() => {
        if (match.params.type === 'server') {
            setFirstSectionHeaders([
                'Make',
                'Model',
                'OS',
                'RAM',
                'Local HHD',
                '# of Cores',
                'MFG Tag',
                'Serial #',
                'IP Address',
                'SAN',
                'FQDN',
            ])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date', 'End of Life'])
            setThirdSectionHeaders(['Employee Assigned', 'Department Assigned', 'Location'])
            axios
                .get(`/detail/server/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([
                        data[0].server.make,
                        data[0].server.model,
                        data[0].server.operatingSystem,
                        data[0].server.ram,
                        data[0].server.localHHD,
                        data[0].server.numberOfCores,
                        data[0].server.mfg,
                        data[0].server.serialNumber,
                        data[0].server.ipAddress,
                        data[0].server.san,
                        data[0].server.fqdn,
                    ])
                    setSecondSectionData([
                        data[0].server.purchaseDate,
                        data[0].server.renewalDate,
                        data[0].server.endOfLife,
                    ])
                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD', data[0].server.location])
                    setCommentText(data[0].server.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'laptop') {
            setFirstSectionHeaders([
                'Make',
                'Model',
                'CPU',
                'RAM',
                'SSD',
                'Screen Size',
                'Monitor Output',
                'Serial #',
                'FQDN',
            ])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date', 'End of Life'])
            setThirdSectionHeaders(['Employee Assigned', 'Department Assigned', 'Location'])
            axios
                .get(`/detail/computer/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([
                        data[0].computer.make,
                        data[0].computer.model,
                        data[0].computer.cpu,
                        data[0].computer.ramgb,
                        data[0].computer.ssdgb,
                        data[0].computer.screenSize,
                        data[0].computer.monitorOutput,
                        data[0].computer.serialNumber,
                        data[0].computer.fqdn,
                    ])
                    setSecondSectionData([
                        data[0].computer.purchaseDate,
                        data[0].computer.renewalDate,
                        data[0].computer.endOfLife,
                    ])
                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD', data[0].computer.location])
                    setCommentText(data[0].computer.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'monitor') {
            setFirstSectionHeaders(['Make', 'Model', 'Screen Size', 'Resolution', 'Inputs', 'Serial #'])
            setSecondSectionHeaders([])
            setThirdSectionHeaders(['Employee Assigned', 'Dept Assigned'])
            axios
                .get(`/detail/monitor/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([
                        data[0].monitor.make,
                        data[0].monitor.model,
                        data[0].monitor.screenSize,
                        data[0].monitor.resolution,
                        data[0].monitor.inputs,
                        data[0].monitor.serialNumber,
                    ])
                    setSecondSectionData([])
                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD'])
                    setCommentText(data[0].monitor.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'peripheral') {
            setFirstSectionHeaders(['Employee Assigned', 'Serial #'])
            setSecondSectionHeaders([])
            setThirdSectionHeaders([])
            axios
                .get(`/detail/peripheral/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([data[0].employeeAssignedName, data[0].peripheral.serialNumber])
                    setSecondSectionData([])
                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD'])
                    setCommentText(data[0].peripheral.textField)
                })
                .catch((err: any) => console.error(err))
        }
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive ${hardwareData.name}?`)) {
            //TODO: a post request to archive user w/ id match.params.id
            history.push('/employees')
        }
    }
    const handleSubmit = () => {}

    // make first section
    function renderSection(sectionHeaders: string[], sectionData: any[]) {
        var rows = []
        for (let i = 0; i < sectionHeaders.length; i += 3) {
            rows.push(
                <div className={styles.row}>
                    {sectionHeaders[i] && (
                        <div className={styles.inputContainer}>
                            <div className={styles.inputHeader}>{sectionHeaders[i]}</div>
                            <input type='text' className={styles.input} placeholder={sectionData[i]}></input>
                        </div>
                    )}
                    {sectionHeaders[i + 1] && (
                        <div className={styles.inputContainer}>
                            <div className={styles.inputHeader}>{sectionHeaders[i + 1]}</div>
                            <input type='text' className={styles.input} placeholder={sectionData[i + 1]}></input>
                        </div>
                    )}
                    {sectionHeaders[i + 2] && (
                        <div className={styles.inputContainer}>
                            <div className={styles.inputHeader}>{sectionHeaders[i + 2]}</div>
                            <input type='text' className={styles.input} placeholder={sectionData[i + 2]}></input>
                        </div>
                    )}
                </div>
            )
        }
        return <div className={styles.section}>{rows}</div>
    }

    return (
        <div className={styles.columns}>
            {/* column 1 */}
            <div className={styles.firstColumn}>
                <Button
                    text='All Hardware'
                    icon='back'
                    onClick={() => {
                        history.push('/hardware')
                    }}
                    className={styles.backButton}
                    textClassName={styles.backButtonText}
                />
                <div className={styles.imgPadding}>
                    {/* <img className={styles.img} src={URL + userData.photo} alt={''} /> */}
                </div>
                <div className={styles.costText}></div>
            </div>

            {/* column 2 */}
            <div className={styles.secondColumn}>
                <div className={styles.hardwareHeader}>Hardware Information</div>
                {/* virtualize checkbox */}
                <div></div>
                {/* first section */}
                {firstSectionHeaders.length > 0 && renderSection(firstSectionHeaders, firstSectionData)}
                {firstSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* second section */}
                {secondSectionHeaders.length > 0 && renderSection(secondSectionHeaders, secondSectionData)}
                {secondSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* third section */}
                {thirdSectionHeaders.length > 0 && renderSection(thirdSectionHeaders, thirdSectionData)}
                {thirdSectionHeaders.length > 0 && <div className={styles.line} />}

                {/* history log */}
                <div className={styles.historyLogContainer}>
                    <HistoryLog historyLog={[{date: 'some day', event: 'Assigned', user: 'Jo'}]} />
                </div>

                {/* comment section */}
                <div>
                    <table className={styles.commentContainer}>
                        <tr>
                            <td className={styles.header}>Text Field</td>
                        </tr>
                        <tr>
                            <td className={styles.text}>
                                In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to
                                demonstrate the visual form of a document without relying on meaningful content.
                                Replacing the actual content with placeholder text allows designers to design the form
                                of the content before the content itself has been produced.
                            </td>
                        </tr>
                    </table>
                </div>
                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
