import {
	ChangeEventHandler,
	FC,
	MouseEventHandler,
	ReactNode,
	useState,
} from "react";

interface SettingProps {
	name?: string;
	desc?: string;
	children?: ReactNode;
	className?: string;
	heading?: boolean;
	style?: React.CSSProperties | undefined;
}

interface SettingComponent extends FC<SettingProps> {
	Text: FC<SettingTextProps>;
	Button: FC<SettingButtonProps>;
	Dropdown: FC<SettingDropdownProps>;
	ExtraButton: FC<SettingExtraButtonProps>;
	Toggle: FC<SettingToggleProps>;
	Checkbox: FC<SettingCheckboxProps>;
}

const Setting: SettingComponent = ({
	name = "",
	desc = "",
	children = "",
	className = "",
	heading = false,
	style,
}) => {
	return (
		<div
			style={style}
			className={`setting-item ${className} ${
				heading ? "setting-item-heading" : ""
			}`}
		>
			<div className="setting-item-info">
				<div className="setting-item-name">{name}</div>
				<div className="setting-item-description">{desc}</div>
			</div>
			<div className="setting-item-control">{children}</div>
		</div>
	);
};

interface SettingTextProps {
	type?: string;
	spellCheck?: boolean;
	placeHolder?: string;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	value?: string | number | readonly string[];
}

Setting.Text = ({
	type = "text",
	spellCheck = false,
	placeHolder = "",
	onChange = () => {},
	value,
}) => {
	return (
		<input
			value={value}
			type={type}
			spellCheck={spellCheck}
			placeholder={placeHolder}
			onChange={onChange}
		/>
	);
};

interface SettingButtonProps {
	onClick?: MouseEventHandler<HTMLButtonElement>;
	children?: ReactNode;
	cta?: boolean;
}

Setting.Button = ({ onClick, children, cta = false }) => {
	return (
		<button className={cta ? "mod-cta" : ""} onClick={onClick}>
			{children}
		</button>
	);
};

interface SettingDropdownProps {
	options: Record<string, { displayValue: string; desc?: string }>;
	onChange?: ChangeEventHandler<HTMLSelectElement>;
	value?: string | number | readonly string[];
	disabled?: boolean;
}

Setting.Dropdown = ({ options = {}, onChange, value, disabled = false }) => {
	return (
		<select
			disabled={disabled}
			className="dropdown"
			onChange={onChange}
			value={value}
		>
			{Object.entries(options).map(([value, { displayValue }], index) => {
				return (
					<option key={index} value={value}>
						{displayValue}
					</option>
				);
			})}
		</select>
	);
};

interface SettingCheckboxProps {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
}

Setting.Checkbox = ({
	checked = false,
	onChange = () => {},
	disabled = false,
}: SettingCheckboxProps) => {
	const handleChange = () => {
		if (!disabled) {
			const newChecked = !checked;
			onChange(newChecked);
		}
	};

	return (
		<div
			className={`checkbox-container ${checked ? "is-enabled" : ""}`}
			onClick={handleChange}
		>
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(e) => {
					e.stopPropagation();
				}}
			/>
		</div>
	);
};


interface SettingExtraButtonProps {
	icon: ReactNode;
	ariaLabel?: string;
	onClick?: MouseEventHandler<HTMLDivElement>;
}

Setting.ExtraButton = ({ onClick = () => {}, icon, ariaLabel = "" }) => {
	return (
		<div
			className="clickable-icon extra-setting-button"
			aria-label={ariaLabel}
			onClick={onClick}
		>
			{icon}
		</div>
	);
};

interface SettingToggleProps {
	disabled?: boolean;
	defaultChecked?: boolean;
	onChange?: MouseEventHandler<HTMLDivElement>;
}

Setting.Toggle = ({
	disabled = false,
	defaultChecked = false,
	onChange = () => {},
}) => {
	const [checked, setChecked] = useState(defaultChecked);
	return (
		<div
			className={`checkbox-container ${
				checked ? "is-enabled" : "is-disabled"
			}`}
			onClick={(e) => {
				setChecked(!checked);
				onChange(e);
			}}
		>
			<input disabled={disabled} type="checkbox" tabIndex={0} />
		</div>
	);
};

export default Setting;
