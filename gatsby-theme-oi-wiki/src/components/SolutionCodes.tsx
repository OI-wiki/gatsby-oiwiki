import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import React from 'react'
 
interface SolutionCodesProp {
    'tab-labels': string;
}

const SolutionCodes: React.FC<SolutionCodesProp> = ({ children, ...rest }) => {
    const [value, setValue] = React.useState(0)
    const cont = Array.isArray(children) ? children : [children]

    const handleChange = (_: unknown, newValue: number): void => {
        setValue(newValue)
    }

    const labels = rest['tab-labels']?.split(',')
    return (
        <div>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
            >
                {cont?.map((_, i) => {
                    return <Tab label={labels?.[i] ?? 'Code'} key={i} />
                })}
            </Tabs>

            {cont?.map((e, i) => {
                return <div role="tabpanel" hidden={value !== i} key={i}>{e}</div>
            })}
        </div>
    )
}

export default SolutionCodes
