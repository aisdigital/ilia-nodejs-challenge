import { StatusCode } from "../enums/status-code.enums";

export interface IProps {
  statusCode?: StatusCode;
  message?: string;
  data?: string;
}
